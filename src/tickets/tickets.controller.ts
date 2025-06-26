import { Op } from 'sequelize';
import { Body, ConflictException, Controller, Get, Post } from '@nestjs/common';
import { Company } from '../../db/models/Company';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
  TicketType,
} from '../../db/models/Ticket';
import { User, UserRole } from '../../db/models/User';

interface newTicketDto {
  type: TicketType;
  companyId: number;
}

interface TicketDto {
  id: number;
  type: TicketType;
  companyId: number;
  assigneeId: number;
  status: TicketStatus;
  category: TicketCategory;
}

@Controller('api/v1/tickets')
export class TicketsController {
  @Get()
  async findAll() {
    return await Ticket.findAll({ include: [Company, User] });
  }

  @Post()
  async create(@Body() newTicketDto: newTicketDto) {
    const { type, companyId } = newTicketDto;

    const assignees = await User.findAll({
      where: { companyId },
      order: [['createdAt', 'DESC']],
    });
    let assignee: User;
    const existingAccountants: User[] = [];
    const existingCorporateSecretaries: User[] = [];
    const existingDirectors: User[] = [];
    assignees.forEach((a) => {
      switch (a.role) {
        case UserRole.accountant:
          existingAccountants.push(a);
          break;
        case UserRole.corporateSecretary:
          existingCorporateSecretaries.push(a);
          break;
        case UserRole.director:
          existingDirectors.push(a);
          break;
      }
    });

    let category: TicketCategory;
    let userRole: UserRole;
    switch (type) {
      case TicketType.strikeOff:
        if (existingDirectors.length > 1)
          throw new ConflictException(
            `Multiple users with role ${UserRole.director}. Cannot create a ticket`,
          );

        userRole = UserRole.director;
        assignee = existingDirectors[0];
        category = TicketCategory.management;
        break;
      case TicketType.managementReport:
        category = TicketCategory.accounting;
        userRole = UserRole.accountant;

        if (!existingAccountants.length)
          throw new ConflictException(
            `Cannot find user with role ${UserRole.accountant} to create a ticket`,
          );
        assignee = existingAccountants[0];
        break;
      case TicketType.registrationAddressChange: {
        const checkExisting = await Ticket.count({
          where: {
            companyId,
            type,
          },
        });
        if (checkExisting > 0)
          throw new ConflictException(
            `Registration address change already exists`,
          );

        userRole = UserRole.corporateSecretary;
        if (existingCorporateSecretaries.length) {
          assignee = existingCorporateSecretaries[0];
        } else {
          if (existingDirectors.length > 1)
            throw new ConflictException(
              `Multiple users with role ${UserRole.director}. Cannot create a ticket`,
            );

          assignee = existingDirectors[0];
        }

        category = TicketCategory.corporate;
        break;
      }
    }

    if (
      userRole === UserRole.corporateSecretary &&
      existingCorporateSecretaries.length > 1
    )
      throw new ConflictException(
        `Multiple users with role ${UserRole.corporateSecretary}. Cannot create a ticket`,
      );

    if (!assignee)
      throw new ConflictException(
        `Cannot find user with role ${userRole} to create a ticket`,
      );

    const ticket = await Ticket.create({
      companyId,
      assigneeId: assignee.id,
      category,
      type,
      status: TicketStatus.open,
    });

    if (type === TicketType.strikeOff) {
      void Ticket.update(
        { status: TicketStatus.resolved },
        {
          where: {
            companyId,
            status: TicketStatus.open,
            id: {
              [Op.ne]: ticket.id,
            },
          },
        },
      );
    }

    const ticketDto: TicketDto = {
      id: ticket.id,
      type: ticket.type,
      assigneeId: ticket.assigneeId,
      status: ticket.status,
      category: ticket.category,
      companyId: ticket.companyId,
    };

    return ticketDto;
  }
}
