# Qrg-Trivia

To create a **low-maintenance & automated** daily trivia or weekly quiz extension to the **Vibe module**, introducing gamification while allowing employees to learn about:
- Company Culture, History & Fun Facts
- Achievements & Industry Trends
- HR Documents
- Random Puzzles

## 🛠 Features
- **Weekly Quiz** (6 questions per quiz, 1 from each section)
- **HR-Configurable Quiz Frequency** (daily trivia as future scope)
- **Time-Bound Answering** (30 seconds per question)
- **Dashboard & Vibe Module Visibility**
- **Leaderboards & Incentives** (badges, shoutouts, internal rewards)
- **Multiple Question Sources:**
  - AI-Generated
  - Employee-Submitted
  - HR-Approved or Auto-Live
- **Duplicate Question Handling** (via TF-IDF & Semantic Similarity)

## 📊 Scoring System *(Monthly Resets)*
### **Weekly Quiz**
- ✅ **Correct Answer per Question:** 10 Points
- 🔥 **Bonus for 3-Week Streak:** 20 Points
- ⚡ **Time-Based Bonus (≤10s):** 5 Points
- 📝 **Submitting a New Question:** 5 Points
- 🚀 **Streak-Based Multipliers:** 1.2x points for 3 consecutive correct answers

## 🎁 Incentives & Rewards
- 🏅 **Virtual Badges on Vibe**
- 📢 **Shoutouts on Dashboard, Emails & Vibe**
- 🏆 **Leaderboards**
- 🎉 **Internal Rewards (Organization-Specific)**

## 🏗 Question Generation Methods
1. **AI-Generated Questions**
2. **Employee-Submitted Questions**
3. **HR’s Choice**
   - Upload docs → AI extracts text & generates questions
   - AI-generated questions via prompt input

HR/Admin acts as a reviewer & can:
- Approve, reject, modify questions
- Plan questions up to **1 week in advance**

## 🤔 Addressing Key Issues
- **Categorization of Questions**
  - `CC&H` - Company Culture, History, Fun Facts
  - `CA` - Achievements, Industry Trends (AI-based, updated via Google News RSS)
  - `HRD` - HR Documents (parsed once, refreshed with new docs)
  - `RP&A` - Random Puzzles/Aptitude (pre-made 75+ questions)
- **Handling Limited Company Data** *(Future Scope)*
  - Adjust ratio of puzzle & company-specific questions
- **Onboarding New Employees** *(Future Scope)*
  - Show **"Good to Know" Questions** marked important by HR
- **Recycling Questions** *(Future Scope)*
  - AI rewords & reuses old questions
- **Preventing AI Hallucination & Domain-Specific Issues**
  - **Better Prompt Engineering** & focus on structured categories

## 🔧 Technical Details
### **Handling Duplicate Questions**
1. **Preprocessing**
   - Remove stop words
   - Apply lemmatization
2. **Vectorization & Storage**
   - **TF-IDF Vector** (keyword importance)
   - **Sentence Embeddings** (semantic meaning)
3. **Similarity Check**
   - **Fast Filtering:** TF-IDF + Cosine Similarity
   - **Semantic Check:** Embeddings + Dot Product
4. **Decision Making**
   - **Low similarity → Accept**
   - **High similarity → Reject**

## 🏛 High-Level Architecture
### **Frontend (React.js)**
- Employee Question Submission Form
- Dashboard
- Leaderboards & Badges
- Admin Dashboard for HR Approvals
- Authentication Pages (Login/Register)

### **Backend (Node.js + MongoDB)**
- Admin Panel for HR Review & Scheduling
- Scoring, Leaderboards, & Streak Logic
- AI Question Generation
- Cron Jobs for Automation

### **Database (MongoDB)**
- Stores user scores, streaks, & leaderboard data
- Questions & approval tracking

### **AI Question Generator**
- Uses OpenAI/GPT for Trivia Generation
- Ensures uniqueness via **TF-IDF & Semantic Similarity**

## ⏳ Cron Jobs
| Task | Frequency | Purpose |
|-------|-----------|---------|
| **Daily Question Assignment** | Every day at 05:30 am | Assigns scheduled questions |
| **Leaderboard Update** | Every day at 11:00 pm | Updates points & streak multipliers |
| **Streak Reset** | Every day at 11:30 pm | Resets streaks for inactive users |
| **AI Question Generation** | Every Friday 06:00 am | Generates AI-based questions if needed |
| **HR Review Reminder** | Every Friday 12:00 pm | Reminds HR to review pending questions |
| **Monthly Leaderboard Reset** | 1st of every month 12:30 am | Clears monthly scores but keeps all-time scores |

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Protected | Allowed Roles |
|--------|----------|-------------|------------|---------------|
| POST | /auth/register | Registers a new user | No | Public |
| POST | /auth/login | Authenticates a user and returns a token | No | Public |

### Employee
| Method | Endpoint | Description | Protected | Allowed Roles |
|--------|----------|-------------|------------|---------------|
| GET | /employee/org/:orgId | Fetch all employees belonging to a specific organization | Yes | Admin |

### Organization
| Method | Endpoint | Description | Protected | Allowed Roles |
|--------|----------|-------------|------------|---------------|
| GET | /org | Fetch all organizations | Yes | Public |

### Question
| Method | Endpoint | Description | Protected | Allowed Roles |
|--------|----------|-------------|------------|---------------|
| POST | /question/ | Submit a new question | Yes | Admin, Employee |
| GET | /question/weekly/unapproved/:orgId | Fetch all unapproved questions for next week for a particular organization | Yes | Admin |
| POST | /question/weekly/lambda/callback | Callback to add questions from AWS Lambda | Yes | AWS Lambda |

### Cron Jobs
| Method | Endpoint | Description | Protected | Allowed Roles |
|--------|----------|-------------|------------|---------------|
| post | /cron/startPnAWorkflow/:orgId | Start the startPnAWorkflow for a particular organization | Yes | Admin |