# Qrg-Trivia

## ⏳ Cron Jobs

| Task                                             | Frequency                 | Name                              |
| ------------------------------------------------ | ------------------------- | --------------------------------- |
| **Approve Next Week Questions Request to Admin** | Every saturday at 12:01am | scheduleNextWeekQuestionsApproval |
| **Approve Next Week Questions Request to Admin** | Every friday at 12:01am   | scheduleNextWeekQuestionsApproval |

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

| Method | Endpoint                      | Description             | Protected | Allowed Roles |
| ------ | ----------------------------- | ----------------------- | --------- | ------------- |
| GET    | /org                          | Fetch all organizations | Yes       | Public        |
| GET    | /settings/toggleTrivia/:orgId | Toggle trivia settin    | Yes       | Admin         |
| GET    | /settings/:orgId              | Fetch all settings      | Yes       | Admin         |

### Question

| Method | Endpoint                           | Description                     | Protected | Allowed Roles   |
| ------ | ---------------------------------- | ------------------------------- | --------- | --------------- |
| POST   | /question/                         | Submit a new question           | Yes       | Admin, Employee |
| POST   | /question/new/HRdocs               | Saves New HR Docs Questions     | Yes       | Admin           |
| GET    | /question/weekly/unapproved/:orgId | Fetch weekly questions for quiz | Yes       | Employee        |

### Answer

| Method | Endpoint                        | Description           | Protected | Allowed Roles |
| ------ | ------------------------------- | --------------------- | --------- | ------------- |
| POST   | /answer/submitWeeklyQuizAnswers | Mark answers for quiz | Yes       | Employee      |

### Cron

| Method | Endpoint                        | Description                                                | Protected | Allowed Roles |
| ------ | ------------------------------- | ---------------------------------------------------------- | --------- | ------------- |
| post   | /cron/startPnAWorkflow/:orgId   | Start the startPnAWorkflow for a particular organization   | Yes       | Admin         |
| post   | /cron/startCAnITWorkflow/:orgId | Start the startCAnITWorkflow for a particular organization | Yes       | Admin         |

### Org

| Method | Endpoint                      | Description                       | Protected | Allowed Roles |
| ------ | ----------------------------- | --------------------------------- | --------- | ------------- |
| post   | /settings/toggleTrivia/:orgId | Toggle trivia on & off for an org | Yes       | Admin         |
| post   | /settings/:orgId              | Get settings for an org           | Yes       | Admin         |

### Quiz

| Method | Endpoint                     | Description                                                 | Protected | Allowed Roles |
| ------ | ---------------------------- | ----------------------------------------------------------- | --------- | ------------- |
| post   | /quiz/next/date/:orgId       | Get next weekly quiz date                                   | Yes       | Admin         |
| post   | /quiz/weekly/lambda/callback | Callback function for Lmabda to add questions               | Yes       | Admin         |
| post   | /quiz/new/:orgId             | Make a new quiz entry                                       | Yes       | Admin         |
| post   | /quiz/questions/:orgId       | Get all questions for the next quiz for that particular org | Yes       | Admin         |
