---

## 🚀 Tech Stack

**Frontend:** Next.js 15 • React 19 • Tailwind CSS  
**Backend:** Express.js • Prisma • PostgreSQL  
**AI:** OpenAI Whisper + GPT-4o-mini  
**Infra:** Docker • pnpm • TypeScript

---

## ⚙️ Setup

```bash
# 1️⃣ Clone repo
git clone https://github.com/EzequielGuerraf/ai-scribe-challenge.git
cd ai-scribe-challenge

# 2️⃣ Install dependencies
pnpm install

# 3️⃣ Run database
docker compose up -d

# 4️⃣ Setup .env (apps/api/.env) or use the .env.example
DATABASE_URL="postgresql://scribe:scribe@localhost:5432/scribe"
OPENAI_API_KEY=sk-<your_key_here>
TRANSCRIBE_MODEL=whisper-1
GENERATION_MODEL=gpt-4o-mini
UPLOAD_DIR=./uploads
PORT=4000


# 5️⃣ Migrate DB
cd apps/api
pnpm prisma migrate dev

# Seed database (adds mock patients)
pnpm run seed

# 6️⃣ Start both apps
pnpm start:all
🧠 Frontend: http://localhost:3000
⚙️ Backend: http://localhost:4000

```

## 🧩 Features
✅ List mock patients

📝 Create text or audio notes

🎙️ Transcribe audio → text (Whisper)

🩺 Generate SOAP note (GPT-4o-mini)

📄 View note details (text, transcript, SOAP)

💥 Fallback heuristic if AI fails

## 🔗 API Summary
Method	Endpoint	Purpose
GET	/patients	List all patients
POST	/notes	Create text note
POST	/notes/audio	Upload audio
POST	/notes/:id/transcribe	Transcribe via Whisper
POST	/notes/:id/generate	Generate SOAP (GPT-4o-mini)
GET	/patients/:id/notes	Get patient notes
GET	/notes/:id	Get note detail

## 🧠 AI Integration
Transcription (Whisper)
Converts audio files to text.
Model: whisper-1

SOAP Generation (GPT-4o-mini)
Converts transcript → SOAP structure.

S: Subjective  
O: Objective  
A: Assessment  
P: Plan

If AI fails or quota ends → fallback heuristic SOAP generation is used.

## 🧱 Structure

ai-scribe/
├── apps/
│   ├── api/         # Express backend + Prisma + AI
│   └── web/         # Next.js frontend + Tailwind
├── docker-compose.yml
└── README.md


## 💡 Improvements (Next Steps)
🔐 Auth & role-based users

🎧 Audio recording from browser

☁️ Cloud storage for files (S3)

🧾 Specialty-specific SOAP templates

🌍 Multi-language support

🧠 Add summarization / risk flags via LLMs


👨‍💻 Author: Ezequiel Guerra 
🌎 Uruguay 🔗 LinkedIn · 🐙 GitHub