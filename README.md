# HireMate — AI-Powered Career Assistant

An intelligent recruitment platform connecting candidates and employers through AI, vector search, and automation.

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=flat-square&logo=microsoft-sql-server&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant-DC382C?style=flat-square)
![Cohere](https://img.shields.io/badge/Cohere_AI-39A7F7?style=flat-square)

---

## What It Does

- **Candidates** upload resumes, practice AI-generated interview questions, and get scored feedback
- **Employers** search candidates semantically — meaning-based, not just keyword matching
- **Admins** manage users, reset passwords, and configure the platform

---

## User Roles

| Role | Access |
|------|--------|
| Candidate | Resume upload, AI interview prep, job search, email |
| Employer | Semantic candidate search, AI email generation, resume access |
| Super Admin | Full user management, system configuration |

---

## Key Features

**AI Interview Preparation**
Upload your resume, get 10 tailored questions from Cohere, answer them, and receive a scored report.

| Score | Result |
|-------|--------|
| 8–10 | Interview Ready |
| 6–7 | Minor improvements needed |
| 4–5 | More practice required |
| 0–3 | Needs significant preparation |

**Semantic Candidate Search**
Employer search queries are embedded with Cohere and matched against resume vectors stored in Qdrant — finds relevant candidates beyond exact keyword matches.

**AI Email Generation**
Generates personalized recruitment emails by analyzing the candidate's resume and the employer's job requirements.

**Resume Management**
Upload PDF or DOCX, auto-extract text, generate vector embeddings, and store in Qdrant. Update or download anytime.

**Job Search**
Resume-based job recommendations via Google Custom Search API and Apify web scraping.

---

## Tech Stack

- **Backend** — FastAPI, SQLAlchemy, Alembic, Pydantic
- **Database** — SQL Server (relational), Qdrant (vector)
- **AI** — Cohere (embedding model + chat model)
- **Auth** — JWT, Bcrypt, RBAC
- **Email** — SMTP (Gmail), SendGrid (optional)
- **Optional** — Google Custom Search, Apify, Twilio, VAPI

---

## Setup

### Prerequisites

- Python 3.8+
- SQL Server + SSMS
- Qdrant (Docker or cloud)
- Cohere API key
- Gmail account (for SMTP)

### 1. Clone & Install

```bash
git clone https://github.com/Zaka-Ul-Hassan/HireMate.git
cd HireMate
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Create Database

Open SSMS and run:

```sql
CREATE DATABASE HireMateDB;
```

### 3. Configure Environment

Create a `.env` file in the project root:

```env
# Database
DB_SERVER=localhost
DB_NAME=HireMateDB
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_TRUSTED_CONNECTION=yes

# Cohere AI
COHERE_API_KEY=your_cohere_api_key

# Qdrant
QDRANT_CLUSTER_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION_NAME=Resume3

# JWT
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60

# Email (SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password

# Super Admin
FIRSTNAME=Super
LASTNAME=Admin
EMAIL=superadmin@hiremate.com
PASSWORD=SuperAdmin@999
ROLE=SuperAdmin

# Other
RESET_TOKEN_EXPIRE_MINUTES=15
FRONTEND_BASE_URL=http://127.0.0.1:8000
ENCRYPTION_KEY=your_encryption_key

# Optional
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_CSE_ID=
APIFY_JOB_TOKEN=
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

> Use a Gmail **App Password** for `SMTP_PASSWORD`, not your regular password.
> Generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) after enabling 2-Step Verification.

### 4. Start Qdrant

```bash
docker run -p 6333:6333 qdrant/qdrant
```

Or use [cloud.qdrant.io](https://cloud.qdrant.io) and update `QDRANT_CLUSTER_URL` and `QDRANT_API_KEY` in `.env`.

### 5. Run Migrations & Start

```bash
alembic upgrade head
uvicorn main:app --reload
```

Open `http://127.0.0.1:8000` — API docs at `/docs`.

### 6. First Login

```
Email:    superadmin@hiremate.com
Password: SuperAdmin@999
```

> Change the default password immediately after first login.

---

## Security

- JWT authentication with 60-minute token expiration
- Bcrypt password hashing
- Role-based access control (RBAC)
- SQLAlchemy ORM — parameterized queries only
- File type and size validation on uploads
- Never commit `.env` to Git — rotate API keys regularly

---

## Troubleshooting

**Database connection failed** — Verify SQL Server is running and `DB_SERVER` is correct in `.env`.

**Qdrant connection error** — Check Docker is running (`docker ps`) and `QDRANT_CLUSTER_URL` matches.

**Cohere API error** — Verify `COHERE_API_KEY` and ensure billing is configured at [dashboard.cohere.com](https://dashboard.cohere.com).

**SMTP auth failed** — Use a Gmail App Password, not your regular account password.

**Migration error** — Run `alembic current` to check version, then `alembic upgrade head`.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

Follow PEP 8, use type hints, write docstrings, and add tests for new features.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

**Zaka Ul Hassan** — [zakaulhassan6717@gmail.com](mailto:zakaulhassan6717@gmail.com) · [LinkedIn](https://linkedin.com/in/zaka-ul-hassan-b85587371) · [GitHub](https://github.com/Zaka-Ul-Hassan)
