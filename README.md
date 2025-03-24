# Qrg-Trivia

## ⏳ Features

### Employee Interactions

- Give Weekly Quizzes.
- Earn Badges based on the monthly leaderboard ratings.
- Submit new questions.
- View submitted questions.
- See past quizzes taken.
- View past badges earned.
- Access monthly leaderboard history.

### Admin Features

- View analytics.
- Access monthly leaderboard history.
- Toggle the trivia feature on/off permanently.
- Approve pending questions.
- Edit questions before approval.
- Replace suggested questions with AI-generated or employee-submitted questions.

### Backend Features

- HRD Workflow
- PnA Workflow
- CAnIT Workflow
- Leaderboard
- Scoring
- Authentication
- Awards
- Question Scheduling

### Lambda Functions

- checkAPI_Working
- generatePnA_Questions
- generateCAnIT_Questions
- generateHRD_Questions

## ⏳ Tech Stack

### Frontend

- React.js
- Tailwind
- react-toastify

### Backend

- Node.js
- Express.js
- JWT
- Cron Jobs

### Database

- MongoDB

### AWS

- S3
- API Gateway
- Lambda Functions
- CloudWatch

### Question Generation

- llama-3.3-70b-specdec
- Google RSS Feed
- pdf-parser
- gemini-2.0-flash

## ⏳ Cron Jobs

| Task                                                                   | Frequency                        | Name                                |
| ---------------------------------------------------------------------- | -------------------------------- | ----------------------------------- |
| **Approve Next Week Questions Request to Admin**                       | Every Sunday at 00:01            | `scheduleNextWeekQuestionsApproval` |
| **Make all quizzes live which have approved questions**                | Every Friday at 05:30            | `makeQuizLiveTest`                  |
| **Clear weeklyQuestions database & Reset all DB values for next week** | Every Friday at 00:01            | `cleanWeeklyQuiz`                   |
| **Resets leaderboards, streaks and multipliers**                       | Every 1st of each month at 00:01 | `leaderboardReset`                  |

## 🔌 API Endpoints

### Authentication

| Method | Endpoint         | Description                              | Protected | Allowed Roles |
| ------ | ---------------- | ---------------------------------------- | --------- | ------------- |
| `POST` | `/auth/register` | Registers a new user                     | No        | Public        |
| `POST` | `/auth/login`    | Authenticates a user and returns a token | No        | Public        |

### Employee

| Method | Endpoint                        | Description                            | Protected | Allowed Roles |
| ------ | ------------------------------- | -------------------------------------- | --------- | ------------- |
| `GET`  | `/employee`                     | Fetch all employees in an organization | Yes       | Admin         |
| `GET`  | `/employee/submitted-questions` | Fetch employee details                 | Yes       | Employee      |

### Organization

| Method  | Endpoint                     | Description              | Protected | Allowed Roles |
| ------- | ---------------------------- | ------------------------ | --------- | ------------- |
| `GET`   | `/org`                       | Fetch all organizations  | Yes       | Public        |
| `PATCH` | `/org/settings/toggleTrivia` | Toggle trivia setting    | Yes       | Admin         |
| `GET`   | `/org/settings`              | Fetch all settings       | Yes       | Admin         |
| `POST`  | `/org/settings/genre`        | Add settings for a genre | Yes       | Admin         |
| `GET`   | `/org/analytics`             | Fetch analytics          | Yes       | Admin         |

### Question

| Method | Endpoint                                           | Description                            | Protected | Allowed Roles |
| ------ | -------------------------------------------------- | -------------------------------------- | --------- | ------------- |
| `POST` | `/question`                                        | Submit a new question                  | Yes       | Employee      |
| `GET`  | `/question/weekly/unapproved`                      | Fetch unapproved weekly quiz questions | Yes       | Admin         |
| `GET`  | `/question/test/scheduleNextWeekQuestionsApproval` | TEST ROUTE                             | No        | Admin         |

### Cron Jobs

| Method | Endpoint                      | Description             | Protected | Allowed Roles |
| ------ | ----------------------------- | ----------------------- | --------- | ------------- |
| `POST` | `/cron/test/cleanWeeklyQuiz`  | TEST: Clean Weekly Quiz | No        | Admin         |
| `POST` | `/cron/test/makeQuizLiveTest` | TEST: Make Quiz Live    | No        | Admin         |

### Result

| Method | Endpoint                          | Description                | Protected | Allowed Roles |
| ------ | --------------------------------- | -------------------------- | --------- | ------------- |
| `POST` | `/result/submitWeeklyQuizAnswers` | Submit weekly quiz answers | Yes       | Employee      |
| `GET`  | `/result/employee`                | Get past employee scores   | Yes       | Employee      |

### Leaderboard

| Method | Endpoint                  | Description                     | Protected | Allowed Roles   |
| ------ | ------------------------- | ------------------------------- | --------- | --------------- |
| `POST` | `/leaderboard`            | Toggle trivia on/off for an org | Yes       | Admin, Employee |
| `POST` | `/leaderboard/test/reset` | TEST: Reset leaderboard         | No        | Admin           |

### Quiz

| Method | Endpoint                       | Description                                                | Protected | Allowed Roles |
| ------ | ------------------------------ | ---------------------------------------------------------- | --------- | ------------- |
| `POST` | `/quiz/status`                 | Check if user can take a quiz                              | Yes       | Employee      |
| `POST` | `/quiz/approve`                | Approve weekly quiz questions                              | Yes       | Admin         |
| `POST` | `/quiz/weekly/lambda/callback` | Callback function for Lambda to add questions              | No        | Admin         |
| `POST` | `/quiz/questions`              | Fetch all questions for the next quiz for a particular org | Yes       | Employee      |
