# Qrg-Trivia

## ⏳ Cron Jobs

| Task                          | Frequency                   | Purpose                                         |
| ----------------------------- | --------------------------- | ----------------------------------------------- |
| **Daily Question Assignment** | Every day at 05:30 am       | Assigns scheduled questions                     |
| **Leaderboard Update**        | Every day at 11:00 pm       | Updates points & streak multipliers             |
| **Streak Reset**              | Every day at 11:30 pm       | Resets streaks for inactive users               |
| **AI Question Generation**    | Every Friday 06:00 am       | Generates AI-based questions if needed          |
| **HR Review Reminder**        | Every Friday 12:00 pm       | Reminds HR to review pending questions          |
| **Monthly Leaderboard Reset** | 1st of every month 12:30 am | Clears monthly scores but keeps all-time scores |

## 🔌 API Endpoints

### Authentication

| Method | Endpoint       | Description                              | Protected | Allowed Roles |
| ------ | -------------- | ---------------------------------------- | --------- | ------------- |
| POST   | /auth/register | Registers a new user                     | No        | Public        |
| POST   | /auth/login    | Authenticates a user and returns a token | No        | Public        |

### Employee

| Method | Endpoint             | Description                                              | Protected | Allowed Roles |
| ------ | -------------------- | -------------------------------------------------------- | --------- | ------------- |
| GET    | /employee/org/:orgId | Fetch all employees belonging to a specific organization | Yes       | Admin         |

### Organization

| Method | Endpoint                          | Description             | Protected | Allowed Roles |
| ------ | --------------------------------- | ----------------------- | --------- | ------------- |
| GET    | /org                              | Fetch all organizations | Yes       | Public        |
| GET    | /settings/toggleTrivia/:orgId     | Toggle trivia settin    | Yes       | Admin         |
| GET    | /settings/:orgId                  | Fetch all settings      | Yes       | Admin         |

### Question

| Method | Endpoint                           | Description                                                                | Protected | Allowed Roles   |
| ------ | ---------------------------------- | -------------------------------------------------------------------------- | --------- | --------------- |
| POST   | /question/                         | Submit a new question                                                      | Yes       | Admin, Employee |
| POST    | /question/new/HRdocs              | Saves New HR Docs Questions                                                | Yes       | Admin           |
| GET    | /question/weekly/unapproved/:orgId | Fetch weekly questions for quiz                                            | Yes       | Employee        |

### Answer

| Method | Endpoint                        | Description           | Protected | Allowed Roles |
| ------ | ------------------------------- | --------------------- | --------- | ------------- |
| POST   | /answer/submitWeeklyQuizAnswers | Mark answers for quiz | Yes       | Employee      |

### Cron Jobs

| Method | Endpoint                        | Description                                                | Protected | Allowed Roles |
| ------ | -----------------------------   | --------------------------------------------------------   | --------- | ------------- |
| post   | /cron/startPnAWorkflow/:orgId   | Start the startPnAWorkflow for a particular organization   | Yes       | Admin         |
| post   | /cron/startCAnITWorkflow/:orgId | Start the startCAnITWorkflow for a particular organization | Yes       | Admin         |

### Cron Jobs

| Method | Endpoint                      | Description                                                 | Protected | Allowed Roles |
| ------ | ----------------------------- | ----------------------------------------------------------  | --------- | ------------- |
| post   | /quiz/weekly/lambda/callback  | Callback function for Lmabda to add questions               | Yes       | Admin         |
| post   | /quiz/new/:orgId              | Make a new quiz entry                                       | Yes       | Admin         |
| post   | /quiz/questions/:orgId        | Get all questions for the next quiz for that particular org | Yes       | Admin         |
