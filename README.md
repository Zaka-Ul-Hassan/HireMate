<div align="center">

# 🚀 HireMate

### AI-Powered Career Assistant Platform

*Revolutionizing recruitment with AI, vector search, and intelligent automation*

[**Key Features**](#-key-features) • [**Quick Start**](#-quick-start) • [**Architecture**](#-architecture) • [**Documentation**](#-documentation)

---

<img src="https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi" alt="FastAPI">
<img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python">
<img src="https://img.shields.io/badge/SQL_Server-CC2927?style=flat-square&logo=microsoft-sql-server&logoColor=white" alt="SQL Server">
<img src="https://img.shields.io/badge/Qdrant-DC382C?style=flat-square" alt="Qdrant">
<img src="https://img.shields.io/badge/Cohere_AI-39A7F7?style=flat-square" alt="Cohere">

</div>

---

## 📖 About HireMate

**HireMate** is an intelligent recruitment platform that bridges the gap between talent and opportunity. Using cutting-edge AI technology, vector search, and automation, HireMate transforms how candidates prepare for interviews and how employers discover the perfect talent.

### 🎯 Platform Highlights

```
🤖 AI Interview Coach          →  Practice with personalized questions
🔍 Semantic Candidate Search   →  Find talent beyond keywords  
📄 Smart Resume Analysis       →  Extract insights automatically
✉️ AI Email Generation         →  Craft professional communications
🔐 Role-Based Security         →  Candidates, Employers, Super Admin
```

---

## 👥 User Roles

<table>
<tr>
<td width="33%" valign="top">

### 👤 **Candidate**
*Job Seeker*

- Upload & manage resumes
- AI interview preparation
- Job recommendations
- Email communications
- Profile management

</td>
<td width="33%" valign="top">

### 🏢 **Employer**
*Recruiter*

- AI-powered candidate search
- View candidate profiles
- Generate recruitment emails
- Access resume database
- Communication tracking

</td>
<td width="33%" valign="top">

### 👑 **Super Admin**
*Platform Administrator*

- Full system access
- User management
- Password resets
- System configuration
- Analytics dashboard

</td>
</tr>
</table>

---

## ✨ Key Features

### For Candidates

<details open>
<summary><b>📄 Resume Management</b></summary>

- Upload resumes (PDF, DOCX)
- Update and download anytime
- Automatic text extraction
- Vector embedding generation
- Stored in Qdrant for search

</details>

<details open>
<summary><b>🎤 AI Interview Preparation</b></summary>

**How It Works:**

1. Upload your resume
2. AI analyzes your background
3. Generates 10 tailored questions
4. Answer each question
5. Receive AI evaluation and scoring
6. Get detailed feedback report

**Scoring System:**
- 8-10: Excellent - Interview Ready ✅
- 6-7: Good - Minor improvements needed
- 4-5: Fair - More practice required
- 0-3: Needs significant preparation

</details>

<details open>
<summary><b>🔍 Job Search Integration</b></summary>

- LinkedIn job matching
- Job portal integration
- Resume-based recommendations
- Google Custom Search API
- Apify web scraping

</details>

<details open>
<summary><b>📧 Email Management</b></summary>

- Configure SMTP settings
- Send/receive emails in-app
- Email history tracking
- Professional templates

</details>

---

### For Employers

<details open>
<summary><b>🔎 Smart Candidate Search</b></summary>

**Semantic Vector Search:**

Instead of basic keyword matching, HireMate uses AI to understand meaning:

```
Search: "Python developer with cloud experience"
                    ↓
           Cohere Embedding Model
                    ↓
              Vector Query
                    ↓
         Qdrant Similarity Search
                    ↓
        Ranked Candidate Results
```

Results include:
- Relevance scores
- Skill highlights
- Experience summaries
- Direct resume access

</details>

<details open>
<summary><b>✉️ AI Email Generation</b></summary>

**Intelligent Email Composition:**

The system generates professional, personalized recruitment emails by analyzing:
- Candidate's resume content
- Relevant skills and experience
- Employer's company profile
- Job requirements

**Example Output:**
> *"Dear [Candidate],*
>
> *We were impressed by your expertise in Python and cloud architecture. Your experience with AWS and Docker aligns perfectly with our Senior Backend Engineer role..."*

</details>

---

### For Administrators

<details open>
<summary><b>👥 User Management</b></summary>

- Create candidates and employers
- Update profiles
- Password management
- Account deletion
- Activity monitoring

</details>

<details open>
<summary><b>🔐 Automated Password Reset</b></summary>

When admin resets a password:
1. System generates secure password
2. Email automatically sent to user
3. Includes new password + login link
4. User must change on first login

</details>

---

## 🏗️ Architecture

### High-Level System Design

```
                    ┌─────────────────────────────────┐
                    │      HIREMATE PLATFORM          │
                    │  (FastAPI + JWT Authentication) │
                    └────────────┬────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │  SQL SERVER  │  │    QDRANT    │  │  COHERE AI   │
        │   Database   │  │Vector Search │  │              │
        │              │  │              │  │ Embedding    │
        │• Users       │  │• Resume3     │  │ Model        │
        │• Resumes     │  │  Collection  │  │              │
        │• Employers   │  │• Embeddings  │  │ Chat/Gen     │
        │• Emails      │  │• Metadata    │  │ Model        │
        └──────────────┘  └──────────────┘  └──────────────┘
```

### AI Interview System Flow

```
Candidate Resume
      │
      ▼
┌─────────────────────────┐
│  Cohere Chat Model      │
│  Analyzes & Generates   │
│  10 Questions           │
└───────────┬─────────────┘
            │
            ▼
    Candidate Answers
            │
            ▼
┌─────────────────────────┐
│  Cohere Chat Model      │
│  Evaluates Answers      │
│  Scores & Feedback      │
└───────────┬─────────────┘
            │
            ▼
    Final Report (0-10)
```

### Vector Search System Flow

```
Resume Upload
      │
      ▼
Text Extraction → Cohere Embedding → Qdrant Storage
                     Model              (Resume3)
                                            │
                                            │
Employer Search → Query Embedding ─────────┘
                  (Same Model)              │
                                            ▼
                                    Similarity Search
                                            │
                                            ▼
                                   Ranked Results
```

### Cohere AI - Dual Model Setup

HireMate uses **two separate Cohere models**:

| Model Type | Purpose | Used For |
|------------|---------|----------|
| **Embedding Model** | Vector Generation | Resume vectorization, search queries, semantic matching |
| **Chat Model** | Text Generation | Interview questions, answer evaluation, email generation |

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance web framework
- **Uvicorn** - Lightning-fast ASGI server
- **SQLAlchemy** - Database ORM
- **Alembic** - Database migrations
- **Pydantic** - Data validation

### Database
- **SQL Server** - Relational data storage
- **Qdrant** - Vector database for semantic search

### AI & Machine Learning
- **Cohere AI** - Embeddings & text generation
- **Vector Search** - Semantic similarity matching

### Security
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **RBAC** - Role-based access control

### Communication
- **SMTP** - Email delivery (Gmail)
- **SendGrid** - Alternative email service (optional)

### External APIs
- **Google Custom Search** - Job search
- **Apify** - Job scraping
- **Twilio** - SMS notifications (optional)
- **VAPI** - Voice AI (optional)

---

## 📁 Project Structure

```
HireMate/
│
├── 📄 main.py                          # Application entry point
├── 📄 requirements.txt                 # Python dependencies
├── 📄 config_loader.py                # Configuration loader
├── 📄 init_db.py                      # Database initialization
├── 📄 load_env.py                     # Environment loader
├── 📄 .env                            # Environment variables
├── 📄 .gitignore                      # Git ignore rules
├── 📄 alembic.ini                     # Alembic config
│
├── 📂 alembic/                        # Database Migrations
│   └── 📂 versions/                   # Migration files
│
├── 📂 app/
│   │
│   ├── 📂 models/                     # SQLAlchemy Models
│   │   ├── 📂 base/
│   │   │   ├── all_models.py
│   │   │   ├── model_base.py
│   │   │   └── base_user_dto.py
│   │   ├── 📂 email/
│   │   │   ├── email_replies.py
│   │   │   ├── email_settings.py
│   │   │   └── sent_emails.py
│   │   ├── 📂 resume/
│   │   │   └── resume_model.py
│   │   ├── 📂 user/
│   │   │   ├── role.py
│   │   │   ├── user_role.py
│   │   │   └── user.py
│   │   └── audit_mixin.py
│   │
│   ├── 📂 routes/                     # API Endpoints
│   │   ├── 📂 ai/
│   │   │   ├── chat_request.py
│   │   │   ├── cohere_chat_route.py
│   │   │   ├── cohere_rag_route.py
│   │   │   ├── embedding_request.py
│   │   │   └── voice_agent_route.py
│   │   ├── 📂 auth/
│   │   │   ├── email_schema.py
│   │   │   ├── email_settings_schema.py
│   │   │   └── forgot_password.py
│   │   ├── 📂 email/
│   │   │   ├── email_route.py
│   │   │   └── email_settings_route.py
│   │   ├── 📂 google/
│   │   │   └── google_search_route.py
│   │   ├── 📂 job/
│   │   │   └── job_route.py
│   │   ├── 📂 linkedin/
│   │   │   └── signin_route.py
│   │   ├── 📂 qdrant/
│   │   │   └── qdrant_route.py
│   │   ├── 📂 resume/
│   │   │   ├── resume_crud_route.py
│   │   │   └── resume_processing_route.py
│   │   ├── 📂 sendgrid/
│   │   │   └── sendgrid_route.py
│   │   └── 📂 user/
│   │       ├── user_page_routes.py
│   │       └── user_routes.py
│   │
│   ├── 📂 schemas/                    # Pydantic Schemas
│   │   ├── 📂 google/
│   │   │   └── google_search_schema.py
│   │   ├── 📂 job/
│   │   │   └── job_schema.py
│   │   ├── 📂 resume/
│   │   │   └── resume_schema.py
│   │   ├── 📂 role/
│   │   │   └── role_schema.py
│   │   ├── 📂 shared/
│   │   │   └── gender_enum.py
│   │   ├── 📂 user/
│   │   │   ├── user_schema.py
│   │   │   ├── pagination_schema.py
│   │   │   └── response_schema.py
│   │   └── 📂 ai/
│   │       └── [AI schemas]
│   │
│   ├── 📂 services/                   # Business Logic
│   │   ├── 📂 ai/
│   │   │   ├── cohere_chat_service.py
│   │   │   ├── cohere_rag_service.py
│   │   │   └── voice_agent/
│   │   ├── 📂 authentication/
│   │   │   ├── auth_service.py
│   │   │   ├── role_provider.py
│   │   │   ├── security.py
│   │   │   └── superadmin_provider.py
│   │   ├── 📂 email/
│   │   │   ├── email_service.py
│   │   │   └── email_settings_service.py
│   │   ├── 📂 google/
│   │   │   └── google_search_service.py
│   │   ├── 📂 job/
│   │   │   ├── job_scanner_service.py
│   │   │   └── job_service.py
│   │   ├── 📂 linkedin/
│   │   │   └── signin_service.py
│   │   ├── 📂 qdrant/
│   │   │   └── qdrant_service.py
│   │   ├── 📂 resume/
│   │   │   ├── resume_crud_service.py
│   │   │   ├── resume_parser_service.py
│   │   │   └── resume_processing_service.py
│   │   ├── 📂 scheduler/
│   │   │   └── scheduler.py
│   │   ├── 📂 user/
│   │   │   └── user_service.py
│   │   └── sendgrid_service.py
│   │
│   └── 📂 utils/                      # Utility Functions
│       ├── db.py
│       ├── file_util.py
│       ├── imap_config.py
│       ├── key.py
│       └── smtp_config.py
│
├── 📂 frontend/                       # Frontend Templates & Static Files
│   ├── 📂 static/
│   │   ├── 📂 css/
│   │   │   ├── 📂 dashboard/
│   │   │   ├── 📂 email/
│   │   │   ├── 📂 job/
│   │   │   ├── 📂 layout/
│   │   │   ├── 📂 resume/
│   │   │   ├── 📂 shared/
│   │   │   └── 📂 user/
│   │   ├── 📂 js/
│   │   │   ├── 📂 dashboard/
│   │   │   ├── 📂 email/
│   │   │   ├── 📂 job/
│   │   │   ├── 📂 layout/
│   │   │   ├── 📂 resume/
│   │   │   ├── 📂 shared/
│   │   │   ├── 📂 user/
│   │   │   └── 📂 voice_agent/
│   │   └── 📂 images/
│   │       ├── 📂 lock_images/
│   │       └── 📂 login_images/
│   │
│   └── 📂 templates/                  # HTML Templates
│       ├── 📂 email/
│       │   ├── compose_email.html
│       │   ├── email_inbox.html
│       │   ├── email_settings.html
│       │   └── sent_email.html
│       ├── 📂 job/
│       │   ├── linkedin_job.html
│       │   ├── list.html
│       │   └── logout_modal.html
│       ├── 📂 partials/
│       │   └── logout_modal.html
│       ├── 📂 profile/
│       │   └── edit_profile.html
│       ├── 📂 resume/
│       │   ├── get_resume.html
│       │   ├── resume_crud.html
│       │   ├── resume_list.html
│       │   ├── resume_rag.html
│       │   └── resume_upload.html
│       ├── 📂 shared/
│       │   ├── dashboard.html
│       │   ├── base.html
│       │   ├── navbar.html
│       │   └── sidebar.html
│       └── 📂 user/
│           ├── admin_change_password.html
│           ├── change_password.html
│           ├── forgot_password.html
│           ├── login.html
│           ├── register.html
│           ├── reset_password.html
│           ├── reset_request_sent.html
│           ├── set_password.html
│           ├── update_profile.html
│           └── user_management.html
│
├── 📂 uploads/                        # User Uploads
│   └── 📂 resumes/                    # Resume files
│
└── 📂 logs/                           # Application Logs
```

---

## ⚙️ Installation & Setup

### Prerequisites

Before starting, ensure you have:

- ✅ Python 3.8 or higher
- ✅ SQL Server + SSMS
- ✅ Qdrant (local Docker or cloud)
- ✅ Cohere API account
- ✅ Gmail account (for SMTP)

---

### 🚀 Quick Start

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/Zaka-Ul-Hassan/HireMate.git
cd HireMate
```

#### 2️⃣ Create Virtual Environment

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

#### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4️⃣ Setup SQL Server Database

Open SQL Server Management Studio (SSMS) and create database:

```sql
CREATE DATABASE HireMateDB;
```

#### 5️⃣ Configure Environment Variables

Create `.env` file in project root:

```env
# ==================
# DATABASE
# ==================
DB_SERVER=localhost
DB_NAME=HireMateDB
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_TRUSTED_CONNECTION=yes

# ==================
# COHERE AI
# ==================
COHERE_API_KEY=your_cohere_api_key_here
# Get from: https://dashboard.cohere.com/api-keys
# Configure embedding + chat models in dashboard

# ==================
# QDRANT VECTOR DB
# ==================
QDRANT_CLUSTER_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION_NAME=Resume3

# ==================
# JWT SECURITY
# ==================
JWT_SECRET=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60

# ==================
# EMAIL (SMTP)
# ==================
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
# Use App Password, NOT regular Gmail password!

# ==================
# SUPER ADMIN
# ==================
FIRSTNAME=Super
LASTNAME=Admin
EMAIL=superadmin@hiremate.com
PASSWORD=SuperAdmin@999
ROLE=SuperAdmin
PHONE=+1234567890

# ==================
# PASSWORD RESET
# ==================
RESET_TOKEN_EXPIRE_MINUTES=15
FRONTEND_BASE_URL=http://127.0.0.1:8000

# ==================
# ENCRYPTION
# ==================
ENCRYPTION_KEY=your_encryption_key_here

# ==================
# OPTIONAL SERVICES
# ==================
GOOGLE_SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_CSE_ID=your_cse_id
APIFY_JOB_TOKEN=your_apify_token
APIFY_BASE_URL=https://api.apify.com/v2
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

#### 6️⃣ Setup Qdrant

**Option A - Docker (Local):**
```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 qdrant/qdrant
```

**Option B - Cloud:**
1. Sign up at [cloud.qdrant.io](https://cloud.qdrant.io)
2. Create cluster
3. Get URL and API key
4. Update `.env`

> **Note:** The `Resume3` collection is auto-created on first resume upload.

#### 7️⃣ Run Migrations

```bash
alembic upgrade head
```

#### 8️⃣ Start Application

```bash
uvicorn main:app --reload
```

**Access:**
- Application: `http://127.0.0.1:8000`
- API Docs: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

#### 9️⃣ First Login

**Super Admin credentials:**
- Email: `superadmin@hiremate.com`
- Password: `SuperAdmin@999`

> ⚠️ **Important:** Change the default password immediately after first login!

---

### 📧 Gmail App Password Setup

**Never use your regular Gmail password for SMTP!**

1. Enable 2-Step Verification at [myaccount.google.com/security](https://myaccount.google.com/security)

2. Generate App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select App: "Mail"
   - Select Device: "Other" → Enter "HireMate"
   - Click "Generate"

3. Copy the 16-character password

4. Add to `.env`:
   ```env
   SMTP_PASSWORD=abcdefghijklmnop
   ```

---

## 🐛 VS Code Debugging

Create `.vscode/launch.json`:

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
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

**Debug:**
- Press `F5` or click Debug icon
- Set breakpoints by clicking line numbers
- Inspect variables on hover

---

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific file
pytest tests/test_auth.py

# Verbose output
pytest -v
```

---

## 🚨 Troubleshooting

### Database Connection Failed

**Problem:** Cannot connect to SQL Server

**Solution:**
- Verify SQL Server is running
- Check `DB_SERVER` in `.env`
- Test connection in SSMS
- Try explicit credentials instead of Windows auth

### Qdrant Connection Error

**Problem:** Failed to connect to Qdrant

**Solution:**
- Check if Qdrant is running: `docker ps`
- Verify `QDRANT_CLUSTER_URL` in `.env`
- Test: `curl http://localhost:6333/collections`

### Cohere API Error

**Problem:** Invalid API key

**Solution:**
- Check `COHERE_API_KEY` in `.env`
- Verify key at [dashboard.cohere.com](https://dashboard.cohere.com)
- Ensure billing is configured
- Check usage limits

### Email Sending Failed

**Problem:** SMTP authentication failed

**Solution:**
- Use Gmail **App Password**, not regular password
- Enable 2-Step Verification
- Generate new App Password
- Update `SMTP_PASSWORD` in `.env`

### Migration Error

**Problem:** Database not up to date

**Solution:**
```bash
alembic current              # Check version
alembic history              # See history
alembic upgrade head         # Upgrade
alembic downgrade -1         # Rollback
```

---

## 🔒 Security Best Practices

### Environment Variables
✅ Never commit `.env` to Git  
✅ Use strong, unique passwords  
✅ Rotate API keys regularly  
✅ Separate dev/prod environments  

### Database Security
✅ Use SQLAlchemy ORM (parameterized queries)  
✅ Enable authentication  
✅ Regular backups  
✅ Restrict access  

### API Security
✅ JWT authentication  
✅ Token expiration (60 min)  
✅ Bcrypt password hashing  
✅ Rate limiting  
✅ HTTPS in production  

### File Upload Security
✅ Validate file types  
✅ Scan for malware  
✅ Limit file sizes  
✅ Store outside web root  

---

## 🚀 Deployment

### Production Checklist

- [ ] Update `.env` with production values
- [ ] Set production `FRONTEND_BASE_URL`
- [ ] Configure production database
- [ ] Setup HTTPS/SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable CORS properly
- [ ] Configure logging
- [ ] Setup monitoring
- [ ] Schedule backups
- [ ] Run security audit

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml:**
```yaml
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

Application logs are stored in `logs/`:

```
logs/
├── app.log           # General logs
├── error.log         # Error logs
├── access.log        # API access
└── ai_requests.log   # AI API calls
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "Add amazing feature"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Code Style:**
- Follow PEP 8
- Use type hints
- Write docstrings
- Add tests for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💡 FAQ

**Q: Can I use a different vector database?**  
A: Yes, but you'll need to modify the vector service code. Qdrant is recommended for performance.

**Q: How many resumes can the system handle?**  
A: Tested with 100,000+ resumes. Performance depends on your Qdrant setup.

**Q: Can I use a different AI provider?**  
A: Yes, but you'll need to update the AI service. Cohere is optimized for this use case.

**Q: Is there a frontend included?**  
A: Yes! HireMate includes a full frontend with HTML templates, CSS, and JavaScript.

**Q: Can I customize email templates?**  
A: Yes, modify templates in `frontend/templates/email/`.

---

## 🙏 Acknowledgments

- **FastAPI** - Amazing web framework
- **Cohere** - Powerful AI models
- **Qdrant** - Vector search capabilities
- **SQL Server** - Reliable data storage
- All contributors and testers

---

## 👨‍💻 Developer

**Zaka Ul Hassan**

- 📧 Email: [zakaulhassan6717@gmail.com](mailto:zakaulhassan6717@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/zaka-ul-hassan-b85587371](https://linkedin.com/in/zaka-ul-hassan-b85587371)
- 🐙 GitHub: [@Zaka-Ul-Hassan](https://github.com/Zaka-Ul-Hassan)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ by Zaka Ul Hassan**

</div>
