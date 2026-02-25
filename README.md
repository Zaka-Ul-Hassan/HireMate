# 🚀 HireMate – AI-Powered Career Assistant Platform

<div align="center">

![HireMate Logo](https://img.shields.io/badge/HireMate-AI%20Career%20Assistant-blue?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-DC382C?style=for-the-badge)

**A comprehensive AI-powered platform for job seekers, employers, and recruitment management**

[Features](#-core-features) • [Installation](#%EF%B8%8F-installation--setup) • [Architecture](#-system-architecture) • [API Docs](#-api-documentation)

</div>

---

## 📌 What is HireMate?

**HireMate** is an intelligent career assistant platform that revolutionizes the recruitment process using AI, vector search, and automation. It connects job seekers with employers through smart matching, AI-powered interview preparation, and seamless communication.

### 🎯 Key Highlights

- **AI Interview Preparation** - Practice with AI-generated questions based on your resume
- **Smart Candidate Matching** - Vector search powered by Qdrant for semantic candidate discovery
- **Resume Intelligence** - Upload, manage, and get job recommendations from your resume
- **Email Automation** - Generate professional emails with AI and manage communications
- **Role-Based Access** - Three distinct roles: Candidates, Employers, and Super Admin

---

## 👥 User Roles

### 👤 **Candidate (Job Seeker)**
- Upload and manage resumes
- AI-powered interview practice
- Get job recommendations
- Manage email communications
- Profile management

### 🏢 **Employer**
- Search candidates using AI
- View candidate profiles
- Generate professional emails
- Direct resume access
- Communication tools

### 👑 **Super Admin**
- Full platform access
- User & employer management
- Password reset capabilities
- System administration
- Automated notifications

---

## 🌟 Core Features

### 👤 Candidate Features

#### Resume Management
- ✅ Upload resume (PDF, DOCX)
- ✅ Update existing resume
- ✅ Download resume anytime
- ✅ Automatic embedding generation
- ✅ Vector storage in Qdrant

#### AI Interview Preparation Agent
```
1. Upload Resume → 2. AI Analyzes Resume → 3. Generates 10 Questions
                            ↓
4. Answer Questions → 5. AI Evaluates → 6. Score (0-10) + Feedback
```

- **Resume-Based Questions**: AI generates questions from your experience
- **Answer Evaluation**: Intelligent scoring system
- **Readiness Report**: Get feedback on interview preparedness
- **Score**: 0-10 rating with detailed feedback

#### Job Search Integration
- 🔍 LinkedIn job recommendations
- 🔍 Job portal integration
- 🔍 Resume-based matching
- 🔍 Google Custom Search API
- 🔍 Apify job scraping

#### Communication
- 📧 Configure email settings (SMTP)
- 📧 Send emails directly from platform
- 📧 Receive and manage emails
- 📧 Email history tracking

#### Profile Management
- 👤 Update personal information
- 🔐 Change password
- 🔑 Forgot password recovery
- 🔄 Reset password

---

### 🏢 Employer Features

#### Smart Candidate Search
```
Search Query → Vector Embeddings → Qdrant Search → Ranked Results
                                                        ↓
                                               View Profiles + Resumes
```

- **Semantic Search**: Find candidates by skills, experience, keywords
- **Vector-Based Matching**: AI-powered relevance ranking
- **Profile Preview**: Quick candidate overview
- **Resume Access**: Direct navigation to full resume

#### AI-Powered Email Generation
```
Select Candidate → Add Context → AI Generates Email → Review & Send
```

**Example Output**:
```
Subject: Exciting Opportunity at [Company Name]

Dear [Candidate Name],

We came across your impressive profile and believe your experience 
in [Key Skills] aligns perfectly with our [Position] role...
```

- Context-aware email generation
- Professional templates
- Resume-based personalization
- Edit before sending

#### Communication Tools
- 📧 SMTP email configuration
- 📧 Email management interface
- 📧 Communication history

#### Account Management
- 👤 Profile updates
- 🔐 Password management
- ⚙️ Settings configuration

---

### 👑 Super Admin Features

#### User Management
- ➕ Create new users (candidates)
- ➕ Create new employers
- ✏️ Update user profiles
- 🔐 Change user passwords
- 🔄 Reset passwords
- 🗑️ Delete accounts

#### Automated Password Reset Flow
```
Admin Resets Password → System Generates New Password → Email Sent
                                                              ↓
                                    Email Contains: Password + Login Link
```

**Email Template**:
```
Subject: Your HireMate Password Has Been Reset

Hello [Name],

Your password has been reset by the administrator.

New Password: [Generated Password]
Login Link: [Application URL]

Please change your password after logging in.
```

#### Platform Administration
- 📊 Access to all features
- 👥 User analytics
- 🔧 System configuration
- 📧 Email notifications management

---

## 🧠 AI & Intelligent Systems

### 🤖 AI Interview Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CANDIDATE RESUME                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              COHERE AI CHAT MODEL                            │
│  • Analyzes resume content                                   │
│  • Extracts key skills & experience                          │
│  • Generates 10 relevant questions                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              INTERVIEW QUESTIONS (10)                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              CANDIDATE ANSWERS                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              COHERE AI EVALUATION                            │
│  • Analyzes each answer                                      │
│  • Compares with expected responses                          │
│  • Scores individual answers                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│           FINAL SCORE & FEEDBACK (0-10)                      │
│  • Overall readiness assessment                              │
│  • Strengths & weaknesses                                    │
│  • Improvement recommendations                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 🔍 Vector Search System (Qdrant)

#### Architecture
```
┌──────────────────────────────────────────────────────────────┐
│                   RESUME UPLOAD                               │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│            TEXT EXTRACTION & PROCESSING                       │
│  • Extract text from PDF/DOCX                                 │
│  • Clean and normalize text                                   │
│  • Prepare for embedding                                      │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│          COHERE EMBEDDING MODEL                               │
│  • Converts text to vector embeddings                         │
│  • Dimensions: [Your Model Dimensions]                        │
│  • Captures semantic meaning                                  │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│               QDRANT VECTOR DATABASE                          │
│  Collection: Resume3                                          │
│                                                               │
│  Stored Data:                                                 │
│  • Vector Embeddings                                          │
│  • Payload (Candidate Metadata):                             │
│    - User ID                                                  │
│    - Name                                                     │
│    - Email                                                    │
│    - Skills                                                   │
│    - Experience                                               │
│    - Education                                                │
│    - Resume path                                              │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│             EMPLOYER SEARCH QUERY                             │
│  Example: "Python developer with 3 years experience"         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│          QUERY EMBEDDING (Cohere)                             │
│  • Convert search query to vector                             │
│  • Same embedding model as resumes                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│          VECTOR SIMILARITY SEARCH                             │
│  • Qdrant searches Resume3 collection                         │
│  • Calculates cosine similarity                               │
│  • Returns top matches with scores                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│          RANKED CANDIDATE RESULTS                             │
│  • Sorted by relevance score                                  │
│  • Includes full candidate profiles                           │
│  • Direct resume access                                       │
└──────────────────────────────────────────────────────────────┘
```

#### Collection Details
- **Collection Name**: `Resume3`
- **Vector Storage**: Cohere embeddings
- **Payload Fields**:
  - `user_id`: Unique identifier
  - `name`: Candidate name
  - `email`: Contact email
  - `skills`: List of skills
  - `experience`: Work experience
  - `education`: Educational background
  - `resume_path`: File location

---

### 🤖 Cohere AI Integration

**HireMate uses TWO separate Cohere models**:

#### 1️⃣ Embedding Model
```python
# Used for vector generation
Purpose: Convert resumes to embeddings
Usage:
  - Resume upload processing
  - Search query vectorization
  - Semantic matching
```

#### 2️⃣ Chat/Generation Model
```python
# Used for AI responses
Purpose: Generate text and evaluate content
Usage:
  - Interview question generation
  - Answer evaluation
  - Email generation
  - AI responses
```

**Configuration**:
- Set `COHERE_API_KEY` in `.env`
- Configure models in Cohere dashboard
- Separate API calls for embedding vs chat

---

### 📧 Email Generation System

```
┌──────────────────────────────────────────────────────────────┐
│         EMPLOYER SELECTS CANDIDATE                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│           SYSTEM GATHERS CONTEXT                              │
│  • Candidate resume content                                   │
│  • Candidate skills & experience                              │
│  • Employer company info                                      │
│  • Job position (if provided)                                 │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│           COHERE AI CHAT MODEL                                │
│  • Generates professional email                               │
│  • Personalizes based on resume                               │
│  • Includes relevant details                                  │
│  • Professional tone                                          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│           EMPLOYER REVIEW & EDIT                              │
│  • Preview generated email                                    │
│  • Edit if needed                                             │
│  • Add custom message                                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│           SEND VIA SMTP                                       │
│  • Uses configured SMTP settings                              │
│  • Tracks email in system                                     │
│  • Stores in communication history                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

### Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           HIREMATE PLATFORM                          │
│                                                                      │
│  ┌──────────────┐         ┌──────────────┐        ┌──────────────┐│
│  │  CANDIDATE   │         │   EMPLOYER   │        │ SUPER ADMIN  ││
│  │              │         │              │        │              ││
│  │ • Upload CV  │         │ • Search     │        │ • Manage All ││
│  │ • Practice   │         │ • Email Gen  │        │ • Create     ││
│  │ • Job Search │         │ • View CVs   │        │ • Reset Pwd  ││
│  └──────┬───────┘         └──────┬───────┘        └──────┬───────┘│
│         │                        │                       │         │
│         └────────────────────────┼───────────────────────┘         │
│                                  │                                 │
└──────────────────────────────────┼─────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │      FastAPI Backend        │
                    │  • JWT Authentication       │
                    │  • Role-Based Access        │
                    │  • API Endpoints            │
                    └──────────────┬──────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                           │
        ▼                          ▼                           ▼
┌───────────────┐        ┌──────────────────┐       ┌──────────────────┐
│  SQL SERVER   │        │  QDRANT VECTOR   │       │   COHERE AI      │
│  DATABASE     │        │    DATABASE      │       │                  │
│               │        │                  │       │ • Embedding      │
│ • Users       │        │ • Resume3        │       │   Model          │
│ • Profiles    │        │   Collection     │       │                  │
│ • Resumes     │        │                  │       │ • Chat/Gen       │
│ • Employers   │        │ • Embeddings     │       │   Model          │
│ • Emails      │        │ • Metadata       │       │                  │
└───────────────┘        └──────────────────┘       └──────────────────┘
        │                          │                           │
        └──────────────────────────┼───────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │   External Services         │
                    │                             │
                    │ • Gmail SMTP               │
                    │ • Google Search API        │
                    │ • Apify Job Scraper        │
                    │ • Twilio (Optional)        │
                    │ • VAPI (Voice AI)          │
                    │ • SendGrid (Optional)      │
                    └─────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Alembic** - Database migrations
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation

### Database
- **SQL Server** - Primary database
- **Qdrant** - Vector database for embeddings

### AI & ML
- **Cohere AI** - Embeddings & text generation (2 separate models)
- **Vector Search** - Semantic similarity matching

### Authentication & Security
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Role-Based Access Control** - User roles

### Email & Communication
- **SMTP** - Email sending (Gmail)
- **SendGrid** - Alternative email service

### External APIs
- **Google Custom Search API** - Job search
- **Apify** - Job scraping
- **Twilio** - SMS notifications (optional)
- **VAPI** - Voice AI integration (optional)

---

## ⚙️ Installation & Setup

### Prerequisites

- Python 3.8+
- SQL Server (with SSMS)
- Qdrant (Local or Cloud)
- Cohere API Account
- Gmail Account (for SMTP)

---

### 📥 Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/HireMate.git
cd HireMate
```

---

### 🐍 Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

---

### 📦 Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

**Required packages include:**
- fastapi
- uvicorn
- sqlalchemy
- alembic
- python-jose[cryptography]
- passlib[bcrypt]
- python-multipart
- qdrant-client
- cohere
- python-dotenv
- pyodbc
- and more...

---

### 🗄️ Step 4: Database Setup

#### A. Install SQL Server

1. Download and install [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
2. Install [SQL Server Management Studio (SSMS)](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)

#### B. Create Database

Open SSMS and run:
```sql
CREATE DATABASE HireMateDB;
```

#### C. Configure Database Connection

The connection will be configured in `.env` file (next step).

---

### 🔐 Step 5: Configure Environment Variables

Create a `.env` file in the project root directory:

```bash
touch .env
```

**Add the following configuration:**

```env
# ======================
# DATABASE CONFIGURATION
# ======================
DB_SERVER=localhost
DB_NAME=HireMateDB
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_TRUSTED_CONNECTION=yes

# If using SQL Server authentication instead of Windows auth:
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# ======================
# COHERE AI CONFIGURATION
# ======================
# Get your API key from: https://dashboard.cohere.com/api-keys
COHERE_API_KEY=your_cohere_api_key_here

# Note: Configure separate embedding and chat models in Cohere dashboard
# Embedding Model: Used for resume vectorization
# Chat Model: Used for AI responses and email generation

# ======================
# QDRANT VECTOR DATABASE
# ======================
# Local Qdrant:
QDRANT_CLUSTER_URL=http://localhost:6333

# OR Cloud Qdrant:
# QDRANT_CLUSTER_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here

# Collection name (will be auto-created)
QDRANT_COLLECTION_NAME=Resume3

# ======================
# JWT AUTHENTICATION
# ======================
# Generate a secure secret key:
# python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_SECRET=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60

# ======================
# EMAIL CONFIGURATION (SMTP)
# ======================
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
# Note: Use App Password, not regular Gmail password
# See section: "How to Get Gmail App Password"

# ======================
# SUPER ADMIN CREDENTIALS
# ======================
# This user is auto-created on first run
FIRSTNAME=Super
LASTNAME=Admin
EMAIL=superadmin@hiremate.com
PASSWORD=SuperAdmin@999
ROLE=SuperAdmin
PHONE=+1234567890

# ======================
# PASSWORD RESET
# ======================
RESET_TOKEN_EXPIRE_MINUTES=15
FRONTEND_BASE_URL=http://127.0.0.1:8000

# ======================
# ENCRYPTION
# ======================
# Generate encryption key:
# python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
ENCRYPTION_KEY=your_encryption_key_here

# ======================
# GOOGLE SEARCH API (Optional)
# ======================
GOOGLE_SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_CSE_ID=your_custom_search_engine_id

# ======================
# APIFY JOB SCRAPER (Optional)
# ======================
APIFY_JOB_TOKEN=your_apify_token
APIFY_BASE_URL=https://api.apify.com/v2
ACTOR_ENDPOINT=your_actor_id

# ======================
# SENDGRID (Optional Alternative to SMTP)
# ======================
SENDGRID_API_KEY=your_sendgrid_api_key

# ======================
# TWILIO (Optional - SMS)
# ======================
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# ======================
# VAPI VOICE AI (Optional)
# ======================
VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_PRIVATE_KEY=your_vapi_private_key
VAPI_ASSISTANT_ID=your_assistant_id
VAPI_ASSISTANT_NAME=General Assistant
VAPI_TRANSCRIBER_PROVIDER=deepgram
VAPI_MODEL_PROVIDER=openai
VAPI_MODEL_NAME=gpt-4o-mini
VAPI_SYSTEM_PROMPT=You are a helpful AI assistant.
```

---

### 📧 How to Get Gmail App Password

**Important:** Never use your regular Gmail password for SMTP!

#### Step-by-Step:

1. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select App: "Mail"
   - Select Device: "Other (Custom name)" → Enter "HireMate"
   - Click "Generate"

3. **Copy Password**
   - Google will show a 16-character password
   - Copy this password
   - Paste it in `.env` file as `SMTP_PASSWORD`

4. **Format**
   ```env
   SMTP_PASSWORD=abcd efgh ijkl mnop
   # Or without spaces:
   SMTP_PASSWORD=abcdefghijklmnop
   ```

---

### 🧠 Step 6: Qdrant Setup

#### Option A: Local Qdrant (Docker)

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

Then set in `.env`:
```env
QDRANT_CLUSTER_URL=http://localhost:6333
QDRANT_API_KEY=  # Leave empty for local
```

#### Option B: Qdrant Cloud

1. Sign up at [Qdrant Cloud](https://cloud.qdrant.io/)
2. Create a cluster
3. Get cluster URL and API key
4. Add to `.env`:
```env
QDRANT_CLUSTER_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_api_key
```

**Collection Creation:**
The `Resume3` collection will be automatically created by the application on first resume upload.

---

### 🗃️ Step 7: Run Database Migrations

```bash
alembic upgrade head
```

**What this does:**
- Creates all necessary tables
- Sets up relationships
- Applies schema changes
- Prepares database for use

**Expected output:**
```
INFO  [alembic.runtime.migration] Context impl SQLServerImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> abc123, Initial migration
INFO  [alembic.runtime.migration] Running upgrade abc123 -> def456, Add users table
...
```

---

### 🚀 Step 8: Run the Application

```bash
uvicorn main:app --reload
```

**Application will start at:**
```
http://127.0.0.1:8000
```

**API Documentation (Swagger UI):**
```
http://127.0.0.1:8000/docs
```

**Alternative API Documentation (ReDoc):**
```
http://127.0.0.1:8000/redoc
```

---

### 🎯 Step 9: First Login

#### Super Admin Auto-Creation

On first run, the Super Admin user is automatically created using credentials from `.env`:

```env
EMAIL=superadmin@hiremate.com
PASSWORD=SuperAdmin@999
```

#### Login Steps:

1. Open application at `http://127.0.0.1:8000`
2. Navigate to login page
3. Enter credentials:
   - Email: `superadmin@hiremate.com`
   - Password: `SuperAdmin@999`
4. Click "Login"

#### Post-Login Actions:

✅ **Change Default Password** (Recommended)
✅ **Create Test Users** (Candidates)
✅ **Create Test Employers**
✅ **Upload Sample Resumes**
✅ **Test Features**

---

## 🐛 Debugging with VS Code

### Setup Debug Configuration

1. **Create `.vscode` folder** in project root:
```bash
mkdir .vscode
```

2. **Create `launch.json`** inside `.vscode`:
```bash
touch .vscode/launch.json
```

3. **Add configuration:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI: Uvicorn",
      "type": "debugpy",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "main:app",
        "--host", "127.0.0.1",
        "--port", "8000",
        "--reload"
      ],
      "justMyCode": true,
      "console": "internalConsole",
      "cwd": "${workspaceFolder}",
      "env": {
        "PYTHONPATH": "${workspaceFolder}"
      }
    }
  ]
}
```

### How to Debug:

1. **Set Breakpoints**: Click left margin in VS Code
2. **Start Debugging**: Press `F5` or click Debug icon
3. **Test API**: Make requests to trigger breakpoints
4. **Inspect Variables**: Hover over variables to see values
5. **Step Through Code**: Use debug controls

---

## 📂 Project Structure

```
HireMate/
│
├── main.py                      # Application entry point
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables (create this)
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
│
├── alembic/                     # Database migrations
│   ├── versions/               # Migration files
│   ├── env.py                  # Alembic environment
│   └── alembic.ini             # Alembic configuration
│
├── app/
│   ├── __init__.py
│   │
│   ├── api/                    # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── users.py           # User management
│   │   ├── employers.py       # Employer endpoints
│   │   ├── resumes.py         # Resume operations
│   │   ├── search.py          # Candidate search
│   │   ├── interview.py       # AI interview
│   │   └── emails.py          # Email management
│   │
│   ├── core/                   # Core functionality
│   │   ├── __init__.py
│   │   ├── config.py          # Configuration
│   │   ├── security.py        # Security utilities
│   │   └── database.py        # Database connection
│   │
│   ├── models/                 # Database models
│   │   ├── __init__.py
│   │   ├── user.py            # User model
│   │   ├── employer.py        # Employer model
│   │   ├── resume.py          # Resume model
│   │   └── email.py           # Email model
│   │
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── employer.py
│   │   ├── resume.py
│   │   └── email.py
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py    # Authentication
│   │   ├── resume_service.py  # Resume processing
│   │   ├── vector_service.py  # Qdrant operations
│   │   ├── ai_service.py      # Cohere AI integration
│   │   ├── email_service.py   # Email operations
│   │   └── job_service.py     # Job search
│   │
│   └── utils/                  # Utility functions
│       ├── __init__.py
│       ├── email_utils.py     # Email helpers
│       ├── file_utils.py      # File operations
│       └── validators.py      # Input validation
│
├── uploads/                    # User uploaded files
│   └── resumes/               # Resume storage
│
├── logs/                       # Application logs
│
└── tests/                      # Unit tests
    ├── __init__.py
    ├── test_auth.py
    ├── test_resume.py
    └── test_search.py
```

---

## 🔄 System Flows

### 1️⃣ Candidate Registration & Resume Upload Flow

```
┌────────────────────────────────────────────────────────┐
│ STEP 1: Candidate Registration                         │
│  • Fills registration form                             │
│  • System creates user account                         │
│  • Password hashed with bcrypt                         │
│  • JWT token generated                                 │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 2: Resume Upload                                  │
│  • Candidate uploads resume (PDF/DOCX)                 │
│  • File saved to uploads/resumes/                      │
│  • File path stored in database                        │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 3: Text Extraction                                │
│  • Extract text from PDF/DOCX                          │
│  • Clean and normalize content                         │
│  • Parse key sections (skills, experience, education)  │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 4: Generate Embeddings                            │
│  • Send text to Cohere Embedding Model                 │
│  • Receive vector embedding                            │
│  • Vector dimensions: [Model Specific]                 │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 5: Store in Qdrant                                │
│  • Create/Update point in Resume3 collection           │
│  • Store vector embedding                              │
│  • Store payload:                                      │
│    - user_id                                           │
│    - name                                              │
│    - email                                             │
│    - skills                                            │
│    - experience                                        │
│    - resume_path                                       │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 6: Update Database                                │
│  • Update user profile with resume info                │
│  • Mark resume as processed                            │
│  • Log upload timestamp                                │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 7: Ready for Search & AI Features                 │
│  • Profile visible in employer searches                │
│  • Resume ready for AI interview                       │
│  • Job recommendations enabled                         │
└────────────────────────────────────────────────────────┘
```

---

### 2️⃣ AI Interview Preparation Flow

```
┌────────────────────────────────────────────────────────┐
│ STEP 1: Candidate Initiates Interview                  │
│  • Clicks "Start AI Interview"                         │
│  • System validates resume exists                      │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 2: Resume Analysis                                │
│  • Load resume content from database                   │
│  • Parse key information:                              │
│    - Skills mentioned                                  │
│    - Work experience                                   │
│    - Projects                                          │
│    - Education                                         │
│    - Achievements                                      │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 3: AI Question Generation (Cohere Chat Model)     │
│  • Send resume context to Cohere                       │
│  • AI analyzes resume                                  │
│  • Generates 10 relevant questions:                    │
│    - Technical questions based on skills               │
│    - Behavioral questions based on experience          │
│    - Scenario-based questions                          │
│  • Questions stored in session                         │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 4: Present Questions to Candidate                 │
│  • Display one question at a time                      │
│  • Candidate types answer                              │
│  • Answer saved to session                             │
│  • Move to next question                               │
│  • Repeat for all 10 questions                         │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 5: Answer Evaluation (Cohere Chat Model)          │
│  • For each question-answer pair:                      │
│    - Send to Cohere AI                                 │
│    - AI evaluates:                                     │
│      * Relevance to question                           │
│      * Depth of answer                                 │
│      * Technical accuracy                              │
│      * Communication clarity                           │
│    - Assign individual score (0-10)                    │
│    - Generate feedback                                 │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 6: Calculate Overall Score                        │
│  • Average individual scores                           │
│  • Calculate overall score (0-10)                      │
│  • Determine readiness level:                          │
│    - 8-10: Excellent, Ready                            │
│    - 6-7: Good, Minor improvements                     │
│    - 4-5: Fair, Practice needed                        │
│    - 0-3: Poor, Significant preparation needed         │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 7: Generate Report                                │
│  • Overall score displayed                             │
│  • Per-question breakdown                              │
│  • Strengths identified                                │
│  • Areas for improvement                               │
│  • Recommendations provided                            │
│  • Report saved to database                            │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 8: Candidate Review                               │
│  • View detailed feedback                              │
│  • Option to retake interview                          │
│  • Export report (PDF)                                 │
│  • Track progress over time                            │
└────────────────────────────────────────────────────────┘
```

---

### 3️⃣ Employer Search Flow

```
┌────────────────────────────────────────────────────────┐
│ STEP 1: Employer Enters Search Query                   │
│  • Example: "Python developer with React experience"   │
│  • Keywords extracted                                  │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 2: Query Vectorization                            │
│  • Send query to Cohere Embedding Model                │
│  • Convert text to vector embedding                    │
│  • Same model used for resume embeddings               │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 3: Vector Search in Qdrant                        │
│  • Search Resume3 collection                           │
│  • Calculate cosine similarity between:                │
│    - Query vector                                      │
│    - All resume vectors                                │
│  • Return top N matches (e.g., top 20)                 │
│  • Sorted by similarity score                          │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 4: Fetch Candidate Details                        │
│  • Get candidate IDs from Qdrant results               │
│  • Query SQL Server for full profiles                  │
│  • Combine vector search results with DB data          │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 5: Display Results                                │
│  • Show ranked list of candidates                      │
│  • Display for each:                                   │
│    - Name                                              │
│    - Key skills                                        │
│    - Experience summary                                │
│    - Similarity score                                  │
│    - Preview snippet                                   │
│  • Options:                                            │
│    - View full profile                                 │
│    - View resume                                       │
│    - Generate email                                    │
└────────────────────────────────────────────────────────┘
```

---

### 4️⃣ Email Generation & Sending Flow

```
┌────────────────────────────────────────────────────────┐
│ STEP 1: Employer Selects Candidate                     │
│  • From search results                                 │
│  • Click "Generate Email"                              │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 2: Gather Context                                 │
│  • Candidate information:                              │
│    - Name                                              │
│    - Skills                                            │
│    - Experience                                        │
│    - Resume summary                                    │
│  • Employer information:                               │
│    - Company name                                      │
│    - Job title (if provided)                           │
│    - Company description                               │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 3: AI Email Generation (Cohere Chat Model)        │
│  • Send context to Cohere AI                           │
│  • AI generates professional email:                    │
│    - Personalized greeting                             │
│    - Reference to specific skills                      │
│    - Company introduction                              │
│    - Role description                                  │
│    - Call to action                                    │
│    - Professional closing                              │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 4: Employer Review                                │
│  • Preview generated email                             │
│  • Edit if needed:                                     │
│    - Modify subject line                               │
│    - Adjust content                                    │
│    - Add custom message                                │
│  • Approve to send                                     │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 5: Send Email via SMTP                            │
│  • Use employer's configured SMTP settings             │
│  • Send email to candidate                             │
│  • Track sending status                                │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 6: Log Communication                              │
│  • Save email to database:                             │
│    - Sender (employer)                                 │
│    - Recipient (candidate)                             │
│    - Subject                                           │
│    - Content                                           │
│    - Timestamp                                         │
│    - Status                                            │
│  • Update communication history                        │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 7: Confirmation                                   │
│  • Display success message                             │
│  • Option to view sent emails                          │
│  • Continue searching candidates                       │
└────────────────────────────────────────────────────────┘
```

---

### 5️⃣ Password Reset Flow (Admin)

```
┌────────────────────────────────────────────────────────┐
│ STEP 1: Admin Selects User                             │
│  • Navigate to user management                         │
│  • Select user to reset password                       │
│  • Click "Reset Password"                              │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 2: Generate New Password                          │
│  • System generates secure password:                   │
│    - 12+ characters                                    │
│    - Upper & lowercase                                 │
│    - Numbers                                           │
│    - Special characters                                │
│  • Hash password with bcrypt                           │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 3: Update Database                                │
│  • Update user's password hash                         │
│  • Set password_reset_required flag                    │
│  • Log password reset event                            │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 4: Generate Reset Email                           │
│  • Create email with:                                  │
│    - Subject: "Your Password Has Been Reset"           │
│    - New password (plaintext, secure send)             │
│    - Login link                                        │
│    - Instructions to change password                   │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 5: Send Email via SMTP                            │
│  • Use system SMTP configuration                       │
│  • Send to user's registered email                     │
│  • Track delivery status                               │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 6: User Receives Email                            │
│  • Opens email                                         │
│  • Copies new password                                 │
│  • Clicks login link                                   │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ STEP 7: First Login with New Password                  │
│  • User logs in with new password                      │
│  • System forces password change                       │
│  • User sets their own password                        │
│  • System clears password_reset_required flag          │
└────────────────────────────────────────────────────────┘
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "candidate"
}

Response: 201 Created
{
  "id": 1,
  "email": "user@example.com",
  "role": "candidate",
  "created_at": "2025-01-15T10:30:00"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "candidate"
  }
}
```

---

### Resume Endpoints

#### Upload Resume
```http
POST /api/resumes/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: resume.pdf

Response: 201 Created
{
  "id": 1,
  "filename": "resume.pdf",
  "file_path": "/uploads/resumes/user_1_resume.pdf",
  "uploaded_at": "2025-01-15T10:30:00",
  "status": "processed",
  "embedding_id": "abc123"
}
```

#### Get Resume
```http
GET /api/resumes/{resume_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "filename": "resume.pdf",
  "file_path": "/uploads/resumes/user_1_resume.pdf",
  "uploaded_at": "2025-01-15T10:30:00",
  "download_url": "/api/resumes/1/download"
}
```

---

### Search Endpoints

#### Search Candidates
```http
POST /api/search/candidates
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "Python developer with 3 years experience",
  "limit": 20
}

Response: 200 OK
{
  "results": [
    {
      "candidate_id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "skills": ["Python", "Django", "React"],
      "experience_years": 3,
      "similarity_score": 0.92,
      "resume_id": 456
    },
    ...
  ],
  "total": 20,
  "query_time_ms": 150
}
```

---

### AI Interview Endpoints

#### Start Interview
```http
POST /api/interview/start
Authorization: Bearer {token}

Response: 200 OK
{
  "interview_id": "int_123",
  "questions": [
    {
      "question_id": 1,
      "question": "Tell me about your experience with Python..."
    },
    ...
  ],
  "total_questions": 10
}
```

#### Submit Answer
```http
POST /api/interview/{interview_id}/answer
Authorization: Bearer {token}
Content-Type: application/json

{
  "question_id": 1,
  "answer": "I have 3 years of experience with Python..."
}

Response: 200 OK
{
  "question_id": 1,
  "submitted": true,
  "next_question_id": 2
}
```

#### Get Results
```http
GET /api/interview/{interview_id}/results
Authorization: Bearer {token}

Response: 200 OK
{
  "interview_id": "int_123",
  "overall_score": 8.5,
  "readiness": "Excellent - Ready for interviews",
  "question_scores": [
    {
      "question_id": 1,
      "score": 9,
      "feedback": "Excellent answer with specific examples"
    },
    ...
  ],
  "strengths": ["Technical knowledge", "Communication"],
  "improvements": ["Add more specific examples"]
}
```

---

### Email Endpoints

#### Generate Email
```http
POST /api/emails/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "candidate_id": 123,
  "job_title": "Senior Python Developer",
  "additional_context": "Looking for immediate hire"
}

Response: 200 OK
{
  "subject": "Exciting Opportunity at [Company]",
  "body": "Dear John,\n\nWe came across your profile...",
  "generated_at": "2025-01-15T10:30:00"
}
```

#### Send Email
```http
POST /api/emails/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "candidate@example.com",
  "subject": "Job Opportunity",
  "body": "Dear John,...",
  "candidate_id": 123
}

Response: 200 OK
{
  "email_id": 789,
  "status": "sent",
  "sent_at": "2025-01-15T10:35:00"
}
```

---

## 🧪 Testing

### Run Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

### Test Structure

```python
# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register_user():
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "candidate"
    })
    assert response.status_code == 201
    assert "id" in response.json()

def test_login():
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "TestPass123!"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Error
```
Error: Unable to connect to SQL Server
```

**Solution:**
- Verify SQL Server is running
- Check `DB_SERVER` in `.env`
- Test connection in SSMS
- Ensure Windows authentication is enabled (if using `DB_TRUSTED_CONNECTION=yes`)
- Try adding explicit credentials if needed

#### 2. Qdrant Connection Error
```
Error: Failed to connect to Qdrant
```

**Solution:**
- Verify Qdrant is running (if local): `docker ps`
- Check `QDRANT_CLUSTER_URL` in `.env`
- Verify API key (if using cloud)
- Test connection: `curl http://localhost:6333/collections`

#### 3. Cohere API Error
```
Error: Invalid API key
```

**Solution:**
- Verify `COHERE_API_KEY` in `.env`
- Check API key in [Cohere Dashboard](https://dashboard.cohere.com)
- Ensure billing is set up
- Check API usage limits

#### 4. Email Sending Fails
```
Error: SMTP authentication failed
```

**Solution:**
- Use Gmail App Password, not regular password
- Enable 2-Step Verification
- Generate new App Password
- Update `SMTP_PASSWORD` in `.env`
- Check `SMTP_SERVER` and `SMTP_PORT`

#### 5. Alembic Migration Error
```
Error: Target database is not up to date
```

**Solution:**
```bash
# Check current version
alembic current

# See migration history
alembic history

# Upgrade to latest
alembic upgrade head

# Rollback one version
alembic downgrade -1
```

#### 6. File Upload Error
```
Error: File size exceeds limit
```

**Solution:**
- Check file size (max: 10MB recommended)
- Verify `uploads/resumes/` directory exists
- Check file permissions
- Ensure supported format (PDF, DOCX)

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` to Git
- ✅ Use strong, unique passwords
- ✅ Rotate API keys regularly
- ✅ Use separate environments (dev/prod)

### Database Security
- ✅ Use parameterized queries (SQLAlchemy ORM)
- ✅ Enable SQL Server authentication
- ✅ Regular backups
- ✅ Restrict database access

### API Security
- ✅ JWT token authentication
- ✅ Token expiration (60 minutes)
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting (recommended)
- ✅ HTTPS in production

### File Upload Security
- ✅ Validate file types
- ✅ Scan for malware
- ✅ Limit file sizes
- ✅ Store outside web root

---

## 🚀 Deployment

### Production Checklist

- [ ] Update `.env` with production values
- [ ] Set `FRONTEND_BASE_URL` to production URL
- [ ] Configure production database
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable CORS properly
- [ ] Set up logging
- [ ] Configure monitoring
- [ ] Set up backups
- [ ] Run security audit

### Docker Deployment (Optional)

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - qdrant

  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  qdrant_data:
```

---

## 📊 Monitoring & Logs

### Application Logs

Logs are stored in `logs/` directory:
```
logs/
├── app.log           # General application logs
├── error.log         # Error logs
├── access.log        # API access logs
└── ai_requests.log   # AI API call logs
```

### Log Configuration

```python
# app/core/logging_config.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style
- Follow PEP 8
- Use type hints
- Write docstrings
- Add tests for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Support

### Getting Help

- 📧 Email: support@hiremate.com
- 💬 Discord: [Join our server](https://discord.gg/hiremate)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/HireMate/issues)
- 📖 Docs: [Full Documentation](https://docs.hiremate.com)

### Reporting Bugs

When reporting bugs, please include:
- Operating system
- Python version
- Error message
- Steps to reproduce
- Expected vs actual behavior

---

## 🎯 Roadmap

### Upcoming Features

- [ ] Multi-language support
- [ ] Video interview integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] Skill assessments
- [ ] Employer reviews
- [ ] Salary insights
- [ ] Career path recommendations
- [ ] Integration with LinkedIn

---

## 💡 FAQ

### Q: Can I use a different vector database?
**A:** Yes, but you'll need to modify the vector service code. Qdrant is recommended for performance.

### Q: How many resumes can the system handle?
**A:** Tested with 100,000+ resumes. Performance depends on your Qdrant setup.

### Q: Can I use a different AI provider?
**A:** Yes, but you'll need to update the AI service. Cohere is optimized for this use case.

### Q: Is there a frontend included?
**A:** This is the backend API. You can build your frontend using React, Vue, or any framework.

### Q: Can I customize email templates?
**A:** Yes, modify the email service and templates as needed.

---

## 🙏 Acknowledgments

- **FastAPI** - For the amazing web framework
- **Cohere** - For powerful AI models
- **Qdrant** - For vector search capabilities
- **SQL Server** - For reliable data storage
- All contributors and testers

---

## 📞 Contact

**Project Maintainer:** Your Name

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

<div align="center">

**⭐ Star this repo if you find it helpful! ⭐**

Made with ❤️ by [Your Name]

</div>
