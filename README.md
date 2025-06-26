# ACME ACCOUNTING

Welcome to ACME acounting, this codebase serves as a way for you to
know how we at OSOME work and how you work through challenges while
adopting an existing codebase.

---

There are 3 tasks that you need to do to complete this task, all of them 
must be done for you to move forward.

Keep things elegant, but as simple as possible.

If there are any issues, contact your hiring representative and they 
will clarify it with you.

If you are to use AI/LLM, **DISCLOSE** where and how you used it.

## Context

We have `companies`, companies have `users`.

Every user has a `role`, which defines what this user does in the 
company. There might be multiple users with the same role.

We create `tickets` in a company and assign them to users.

Every ticket has
1. Type - defines the work that should be done by the user
2. Single assignee - the user
3. Category - every type is under a particular category
4. Status - open or resolved

**Endpoints**

- `GET  api/v1/tickets`    - returns all tickets in the system. Without 
                             pagination. This is only for creating logic 
                             testing.
- `POST api/v1/tickets`    - creates a ticket. It accepts `type` and `companyId`
- `POST  api/v1/reports`   - starts the processing of existing data and
                             builds a report.
- `GET  api/v1/reports`    - get status of last report building process.

**Ticket Creation Rules**

If a ticket type is `managementReport`, then the ticket category 
should be `accounting`. The assignee is a user with the role = `Accountant`. 
If there are multiple accountants in the company, 
take the most recently created one.

If a ticket type is `registrationAddressChange`, then the ticket category 
should be `Corporate`. Assignee is a user with the role `Corporate secretary`. 
If there are multiple secretaries, throw an error.

If we cannot find an assignee with the required role, throw an error.

## Tasks

Before working on tasks please clone the repo to your own GitHub account

When done commit the changes and create a PR for the changes in YOUR OWN
repository. Send us a link for review.

### 1. Change requests

This service is old, new business requirements have come in and it
requires us to change the internals of the service.

Let's generate with fixing the behaviour of the service.

**Instructions**

1. When creating a `registrationAddressChange` ticket, if the company 
   already has a ticket with this type, throw a duplication error.
2. Add a new `Director` user role. If we create a `registrationAddressChange`
   ticket, and we cannot find a corporate secretary, assign it to the `Director`. 
   If there are multiple directors, throw an error.

### 2. New ticket

It seems that companies are closing down more than usual, we never considered
this case before. Maybe it's time to add another type of ticket.

**Instructions**

1. Create New Ticket Type
   ```
   {
       "type": "strikeOff",
       "Category": "Management",
       "Assignee": "Director"
   }
   ```

**Side Effects**
- If there are multiple directors, throw an error.
- Resolve all other active tickets in this company (we do not need 
  them anymore as we are closing down the company).

### 3. Optimize

ACME processes tons of data every day. It is essential for us that we
make sure that our internal processes and data are provided accurately
and on time.

We have a legacy service that processes data for us, but it takes a long
time to get the results. Maybe this is a good time to refactor the code.

**Instructions**

1. Optimize the endpoint so that the time it takes to finish an action
   is marginally faster.
2. The endpoint should not hold the connection of the client while processing
   the data in the background.
3. We are looking for performance, not accuracy. If you see numbers not 
   tallying correctly in the report, you may skip it.

**Acceptance**

1. The endpoint should respond faster than the existing implementation
2. Documents should process in the background and the client should be able
   to check the status of the processing.
3. Metrics should be recorded for discussion.

## Stretch Tasks

There are common principles in the repository that are intentionally 
left out and not covered by the base tasks given above. These are common 
best-practice tasks that you can make in any node project. 

Doing more than what is given above will be plus points and will be
considered in our code review session.

Here are some of the topics you can consider:

- [ ]  Code Quality
- [ ]  Fixing Subtle Errors
- [ ]  Using Tests
- [ ]  Performance Considerations

# Project setup and run

1. NPM
```sh
$ nvm use
$ npm install
```

2. Run the DB container
```sh
docker-compose up -d
```

3. Run migrations
```sh
npm run migrate
```

4. Start the server
```sh
npm start
```

5. Go to http://localhost:3000/api/v1/healthcheck 🍾

# Testing
We use the integration tests instead of a unit ones for controllers.
It means we do not mock db requests but perform them on a test db.

To run tests:

1.Run the DB container (if you did not before)
```sh
docker-compose up -d
```

2.Create a db
```sh
npm run db:create:test
```

3. Run migrations
```sh
npm run db:migrate:test
```

4. Test
```sh
npm test
```