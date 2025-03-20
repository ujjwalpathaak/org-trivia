# Qrg-Trivia

## ⏳ Cron Jobs

| Task                                                                   | Frequency                        | Name                              |
| ---------------------------------------------------------------------- | -------------------------------- | --------------------------------- |
| **Approve Next Week Questions Request to Admin**                       | Every sunday at 00:01            | scheduleNextWeekQuestionsApproval |
| **Make all quizzes live which have approved questions**                | Every friday at 05:30            | makeQuizLiveTest                  |
| **Clear weeklyQuestions database & Reset all DB values for next week** | Every friday at 12:01am          | cleanWeeklyQuiz                   |
| **Resets leaderboards, streaks and multipliers**                       | Every 1st of each month at 00:01 | leaderboardReset                  |

## 🔌 API Endpoints

### Authentication

| Method | Endpoint       | Description                              | Protected | Allowed Roles |
| ------ | -------------- | ---------------------------------------- | --------- | ------------- |
| POST   | /auth/register | Registers a new user                     | No        | Public        |
| POST   | /auth/login    | Authenticates a user and returns a token | No        | Public        |

### Employee

| Method | Endpoint                              | Description                                              | Protected | Allowed Roles |
| ------ | ------------------------------------- | -------------------------------------------------------- | --------- | ------------- |
| GET    | /employee/org/:orgId                  | Fetch all employees belonging to a specific organization | Yes       | Admin         |
| GET    | /employee/score/:employeeId           | Get Employee Score                                       | Yes       | Employee      |
| GET    | /employee/:employeeId                 | Fetch employees details                                  | Yes       | Employee      |
| GET    | /employee/quizzes/results/:employeeId | Get all past quizzes results                             | Yes       | Employee      |

### Organization

| Method | Endpoint                          | Description             | Protected | Allowed Roles |
| ------ | --------------------------------- | ----------------------- | --------- | ------------- |
| GET    | /org                              | Fetch all organizations | Yes       | Public        |
| PATCH  | /org/settings/toggleTrivia/:orgId | Toggle trivia settin    | Yes       | Admin         |
| GET    | /org/settings/:orgId              | Fetch all settings      | Yes       | Admin         |
| POST   | /org/settings/genre/:orgId        | Fetch all settings      | Yes       | Admin         |
| GET    | /org/analytics/:orgId             | Fetch all settings      | Yes       | Admin         |

### Question

| Method | Endpoint                                         | Description                                | Protected | Allowed Roles |
| ------ | ------------------------------------------------ | ------------------------------------------ | --------- | ------------- |
| POST   | /question/                                       | Submit a new question                      | Yes       | Employee      |
| POST   | /question/new/HRdocs                             | Saves New HR Docs Questions                |           |               |
| GET    | /question/weekly/unapproved/:orgId               | Fetch weekly unapproved questions for quiz | Yes       | Admin         |
| GET    | /question/test/scheduleNextWeekQuestionsApproval | TEST ROUTE                                 |           |               |

### Answer

| Method | Endpoint                        | Description           | Protected | Allowed Roles |
| ------ | ------------------------------- | --------------------- | --------- | ------------- |
| POST   | /answer/submitWeeklyQuizAnswers | Mark answers for quiz | Yes       | Employee      |

### Cron

| Method | Endpoint                             | Description                                                      | Protected | Allowed Roles |
| ------ | ------------------------------------ | ---------------------------------------------------------------- | --------- | ------------- |
| post   | /cron/test/startPnAWorkflow/:orgId   | TEST: Start the startPnAWorkflow for a particular organization   |           |               |
| post   | /cron/test/startCAnITWorkflow/:orgId | TEST: Start the startCAnITWorkflow for a particular organization |           |               |
| post   | /cron/test/cleanWeeklyQuiz           | TEST: Clean Weekly Quiz                                          |           |               |
| post   | /cron/test/makeQuizLiveTest          | TEST: Make Quiz Live                                             |           |               |

### Result

| Method | Endpoint                        | Description               | Protected | Allowed Roles |
| ------ | ------------------------------- | ------------------------- | --------- | ------------- |
| post   | /result/submitWeeklyQuizAnswers | Submit ans of weekly test | Yes       | Employee      |
| get    | /past/:employeeId               | Get past Employee Scores  | Yes       | Employee      |

### Leaderboard

| Method | Endpoint                | Description                       | Protected | Allowed Roles   |
| ------ | ----------------------- | --------------------------------- | --------- | --------------- |
| post   | /leaderboard/:orgId     | Toggle trivia on & off for an org | Yes       | Admin, Employee |
| post   | /leaderboard/test/reset | TEST: resets the leaderboard      |           | Admin           |

### Quiz

| Method | Endpoint                        | Description                                                 | Protected | Allowed Roles |
| ------ | ------------------------------- | ----------------------------------------------------------- | --------- | ------------- |
| post   | /quiz/status/:orgId/:employeeId | Checks if user can give quiz                                | Yes       | Employee      |
| post   | /quiz/approve/:orgId            | Approve weekly quiz questions                               | Yes       | Admin         |
| post   | /quiz/weekly/lambda/callback    | Callback function for Lmabda to add questions               |           |               |
| post   | /quiz/questions/:orgId          | Get all questions for the next quiz for that particular org | Yes       | Employee      |
