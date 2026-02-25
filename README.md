<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HireMate — AI Career Platform</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --border: #1e1e2e;
    --accent: #6c63ff;
    --accent2: #ff6584;
    --text: #e8e8f0;
    --muted: #6b6b80;
    --code-bg: #0d0d1a;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    line-height: 1.7;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Ambient glow */
  body::before {
    content: '';
    position: fixed;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 500px;
    background: radial-gradient(ellipse, rgba(108,99,255,0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .wrap {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 32px;
    position: relative;
    z-index: 1;
  }

  /* ── HERO ── */
  header {
    padding: 100px 0 80px;
    border-bottom: 1px solid var(--border);
  }

  .badge-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }

  .badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 3px;
    border: 1px solid var(--border);
    color: var(--muted);
    background: var(--surface);
  }

  .badge.live { border-color: var(--accent); color: var(--accent); }

  h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(52px, 8vw, 80px);
    font-weight: 800;
    line-height: 0.95;
    letter-spacing: -0.03em;
    margin-bottom: 20px;
  }

  h1 span {
    -webkit-text-stroke: 1px var(--accent);
    color: transparent;
  }

  .tagline {
    font-size: 17px;
    color: var(--muted);
    max-width: 480px;
    margin-bottom: 36px;
    font-weight: 300;
    line-height: 1.6;
  }

  .btn-row { display: flex; gap: 12px; flex-wrap: wrap; }

  .btn {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.05em;
    padding: 12px 24px;
    border-radius: 4px;
    text-decoration: none;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn-primary {
    background: var(--accent);
    color: #fff;
    border: 1px solid var(--accent);
  }

  .btn-primary:hover { background: #7b73ff; }

  .btn-ghost {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
  }

  .btn-ghost:hover { color: var(--text); border-color: var(--muted); }

  /* ── SECTIONS ── */
  section { padding: 72px 0; border-bottom: 1px solid var(--border); }

  h2 {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 32px;
  }

  h3 {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  /* ── ROLES ── */
  .roles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

  .role-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 28px 24px;
    transition: border-color 0.2s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }

  .role-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--accent);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .role-card:hover { border-color: #2e2e45; transform: translateY(-2px); }
  .role-card:hover::before { opacity: 1; }
  .role-card:nth-child(2)::before { background: var(--accent2); }
  .role-card:nth-child(3)::before { background: #43e8b0; }

  .role-icon {
    font-size: 24px;
    margin-bottom: 14px;
    display: block;
  }

  .role-card h3 { font-size: 16px; margin-bottom: 4px; }

  .role-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 16px;
    display: block;
  }

  .role-card ul { list-style: none; }

  .role-card li {
    font-size: 13px;
    color: var(--muted);
    padding: 3px 0;
    padding-left: 14px;
    position: relative;
  }

  .role-card li::before {
    content: '—';
    position: absolute;
    left: 0;
    color: var(--border);
    font-size: 10px;
  }

  /* ── FEATURES ── */
  .features { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .feature {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 28px;
    transition: border-color 0.2s;
  }

  .feature:hover { border-color: #2e2e45; }

  .feature-tag {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
    display: block;
  }

  .feature h3 { font-size: 16px; margin-bottom: 8px; }

  .feature p { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* ── SCORING ── */
  .score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }

  .score-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 20px 16px;
    text-align: center;
  }

  .score-range {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 4px;
    letter-spacing: -0.02em;
  }

  .score-label { font-size: 11px; color: var(--muted); }

  .score-item:nth-child(1) .score-range { color: #43e8b0; }
  .score-item:nth-child(2) .score-range { color: #6c63ff; }
  .score-item:nth-child(3) .score-range { color: #f0c040; }
  .score-item:nth-child(4) .score-range { color: var(--accent2); }

  /* ── SETUP ── */
  .steps { counter-reset: step; display: flex; flex-direction: column; gap: 0; }

  .step {
    display: flex;
    gap: 24px;
    position: relative;
    padding-bottom: 36px;
  }

  .step:last-child { padding-bottom: 0; }

  .step-num {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--accent);
    position: relative;
    z-index: 1;
  }

  .step:not(:last-child) .step-num::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: calc(100% + 0px);
    background: var(--border);
    margin-top: 8px;
    height: calc(36px + 8px);
  }

  .step-content { padding-top: 6px; }

  .step-content h3 { font-size: 15px; margin-bottom: 6px; }

  .step-content p { font-size: 13px; color: var(--muted); }

  code {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    background: var(--code-bg);
    border: 1px solid var(--border);
    padding: 2px 7px;
    border-radius: 3px;
    color: #a8a8c8;
  }

  pre {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 20px;
    overflow-x: auto;
    margin-top: 12px;
  }

  pre code {
    background: none;
    border: none;
    padding: 0;
    font-size: 12px;
    line-height: 1.7;
    color: #a8a8c8;
  }

  /* ── TECH STACK ── */
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }

  .tech-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px 16px;
    font-size: 13px;
    font-weight: 500;
  }

  .tech-item span {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--muted);
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ── SECURITY ── */
  .security-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .sec-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 16px 20px;
    font-size: 13px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .sec-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    margin-top: 6px;
    flex-shrink: 0;
  }

  /* ── FOOTER ── */
  footer {
    padding: 56px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: gap;
  }

  .author { display: flex; flex-direction: column; gap: 4px; }

  .author-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 18px;
  }

  .author-links { display: flex; gap: 16px; margin-top: 6px; }

  .author-links a {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    text-decoration: none;
    letter-spacing: 0.05em;
    transition: color 0.2s;
  }

  .author-links a:hover { color: var(--text); }

  .mit {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    border: 1px solid var(--border);
    padding: 6px 14px;
    border-radius: 4px;
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  header > * { animation: fadeUp 0.5s ease both; }
  .badge-row { animation-delay: 0.05s; }
  h1 { animation-delay: 0.1s; }
  .tagline { animation-delay: 0.15s; }
  .btn-row { animation-delay: 0.2s; }

  @media (max-width: 680px) {
    .roles { grid-template-columns: 1fr; }
    .features { grid-template-columns: 1fr; }
    .score-grid { grid-template-columns: 1fr 1fr; }
    .security-grid { grid-template-columns: 1fr; }
    footer { flex-direction: column; gap: 24px; }
  }
</style>
</head>
<body>

<div class="wrap">

  <!-- HERO -->
  <header>
    <div class="badge-row">
      <span class="badge live">FastAPI</span>
      <span class="badge">Python</span>
      <span class="badge">Cohere AI</span>
      <span class="badge">Qdrant</span>
      <span class="badge">SQL Server</span>
      <span class="badge">MIT License</span>
    </div>

    <h1>Hire<span>Mate</span></h1>

    <p class="tagline">AI-powered recruitment platform. Candidates practice interviews. Employers find talent semantically. Everyone moves faster.</p>

    <div class="btn-row">
      <a href="https://github.com/Zaka-Ul-Hassan/HireMate" class="btn btn-primary">View on GitHub &rarr;</a>
      <a href="#setup" class="btn btn-ghost">Quick Setup</a>
    </div>
  </header>

  <!-- ROLES -->
  <section>
    <h2>User Roles</h2>
    <div class="roles">
      <div class="role-card">
        <span class="role-icon">&#128100;</span>
        <h3>Candidate</h3>
        <span class="role-label">Job Seeker</span>
        <ul>
          <li>Upload &amp; manage resumes</li>
          <li>AI interview preparation</li>
          <li>Job recommendations</li>
          <li>Email communications</li>
        </ul>
      </div>
      <div class="role-card">
        <span class="role-icon">&#127970;</span>
        <h3>Employer</h3>
        <span class="role-label">Recruiter</span>
        <ul>
          <li>Semantic candidate search</li>
          <li>View candidate profiles</li>
          <li>AI-generated emails</li>
          <li>Resume database access</li>
        </ul>
      </div>
      <div class="role-card">
        <span class="role-icon">&#128081;</span>
        <h3>Super Admin</h3>
        <span class="role-label">Platform Admin</span>
        <ul>
          <li>Full system access</li>
          <li>User management</li>
          <li>Password resets</li>
          <li>System configuration</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section>
    <h2>Features</h2>
    <div class="features">
      <div class="feature">
        <span class="feature-tag">Candidate</span>
        <h3>AI Interview Coach</h3>
        <p>Uploads resume, gets 10 tailored questions generated by Cohere, answers them, receives a scored evaluation with detailed feedback.</p>
      </div>
      <div class="feature">
        <span class="feature-tag">Employer</span>
        <h3>Semantic Candidate Search</h3>
        <p>Beyond keyword matching — queries are embedded with Cohere and matched against resume vectors in Qdrant for truly relevant results.</p>
      </div>
      <div class="feature">
        <span class="feature-tag">Candidate</span>
        <h3>Resume Management</h3>
        <p>Upload PDF or DOCX, auto-extract text, generate vector embeddings, store in Qdrant. Download or update anytime.</p>
      </div>
      <div class="feature">
        <span class="feature-tag">Employer</span>
        <h3>AI Email Generation</h3>
        <p>Generates personalized outreach emails by analyzing the candidate's resume, skills, and the employer's job requirements.</p>
      </div>
      <div class="feature">
        <span class="feature-tag">Candidate</span>
        <h3>Job Search</h3>
        <p>LinkedIn matching and job portal integration via Google Custom Search API and Apify web scraping — recommendations based on your resume.</p>
      </div>
      <div class="feature">
        <span class="feature-tag">All Roles</span>
        <h3>Email Management</h3>
        <p>Configure SMTP, send and receive emails in-app, track history, use professional templates.</p>
      </div>
    </div>
  </section>

  <!-- INTERVIEW SCORING -->
  <section>
    <h2>Interview Scoring</h2>
    <p style="font-size:13px; color:var(--muted); margin-bottom: 24px;">Each AI-evaluated answer is scored 0–10. The final report tells candidates exactly where they stand.</p>
    <div class="score-grid">
      <div class="score-item">
        <div class="score-range">8–10</div>
        <div class="score-label">Interview Ready</div>
      </div>
      <div class="score-item">
        <div class="score-range">6–7</div>
        <div class="score-label">Minor Improvements</div>
      </div>
      <div class="score-item">
        <div class="score-range">4–5</div>
        <div class="score-label">More Practice</div>
      </div>
      <div class="score-item">
        <div class="score-range">0–3</div>
        <div class="score-label">Needs Work</div>
      </div>
    </div>
  </section>

  <!-- TECH STACK -->
  <section>
    <h2>Tech Stack</h2>
    <div class="tech-grid">
      <div class="tech-item">FastAPI <span>Web Framework</span></div>
      <div class="tech-item">SQLAlchemy <span>ORM</span></div>
      <div class="tech-item">Alembic <span>Migrations</span></div>
      <div class="tech-item">SQL Server <span>Relational DB</span></div>
      <div class="tech-item">Qdrant <span>Vector DB</span></div>
      <div class="tech-item">Cohere AI <span>Embeddings + Chat</span></div>
      <div class="tech-item">JWT + Bcrypt <span>Auth &amp; Security</span></div>
      <div class="tech-item">SMTP / SendGrid <span>Email</span></div>
    </div>
  </section>

  <!-- SETUP -->
  <section id="setup">
    <h2>Quick Setup</h2>

    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-content">
          <h3>Clone &amp; install</h3>
          <pre><code>git clone https://github.com/Zaka-Ul-Hassan/HireMate.git
cd HireMate
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt</code></pre>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-content">
          <h3>Create database</h3>
          <p>Open SSMS and run:</p>
          <pre><code>CREATE DATABASE HireMateDB;</code></pre>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-content">
          <h3>Configure <code>.env</code></h3>
          <p>Set your DB connection, Cohere API key, Qdrant URL, JWT secret, and SMTP credentials. See <code>.env.example</code> for all keys.</p>
          <pre><code>COHERE_API_KEY=your_key
QDRANT_CLUSTER_URL=http://localhost:6333
JWT_SECRET=your_secret
SMTP_EMAIL=you@gmail.com
SMTP_PASSWORD=your_app_password</code></pre>
        </div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-content">
          <h3>Start Qdrant (Docker)</h3>
          <pre><code>docker run -p 6333:6333 qdrant/qdrant</code></pre>
        </div>
      </div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-content">
          <h3>Run migrations &amp; start</h3>
          <pre><code>alembic upgrade head
uvicorn main:app --reload</code></pre>
          <p style="margin-top:10px; font-size:13px; color:var(--muted);">App at <code>http://127.0.0.1:8000</code> — API docs at <code>/docs</code></p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">6</div>
        <div class="step-content">
          <h3>First login</h3>
          <p>Email: <code>superadmin@hiremate.com</code> — Password: <code>SuperAdmin@999</code></p>
          <p style="margin-top:6px; font-size:12px; color:var(--accent2);">Change the default password immediately after first login.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- SECURITY -->
  <section>
    <h2>Security</h2>
    <div class="security-grid">
      <div class="sec-item"><div class="sec-dot"></div>JWT authentication with 60-min token expiration</div>
      <div class="sec-item"><div class="sec-dot"></div>Bcrypt password hashing</div>
      <div class="sec-item"><div class="sec-dot"></div>Role-based access control (RBAC)</div>
      <div class="sec-item"><div class="sec-dot"></div>SQLAlchemy ORM — parameterized queries only</div>
      <div class="sec-item"><div class="sec-dot"></div>File type &amp; size validation on uploads</div>
      <div class="sec-item"><div class="sec-dot"></div>Never commit <code>.env</code> — use App Passwords for SMTP</div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer>
    <div class="author">
      <div class="author-name">Zaka Ul Hassan</div>
      <div style="font-size:13px; color:var(--muted);">Developer</div>
      <div class="author-links">
        <a href="mailto:zakaulhassan6717@gmail.com">Email</a>
        <a href="https://linkedin.com/in/zaka-ul-hassan-b85587371">LinkedIn</a>
        <a href="https://github.com/Zaka-Ul-Hassan">GitHub</a>
      </div>
    </div>
    <span class="mit">MIT License</span>
  </footer>

</div>

</body>
</html>
