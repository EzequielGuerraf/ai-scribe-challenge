# 🩺 AI Scribe — Notes Management Tool

> A lightweight **AI-powered** clinical notes manager that transcribes audio and generates SOAP notes automatically.

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

# 4️⃣ Setup .env (apps/api/.env)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scribe"
OPENAI_API_KEY=sk-<your_key>
TRANSCRIBE_MODEL=whisper-1
GENERATION_MODEL=gpt-4o-mini
UPLOAD_DIR=./uploads
PORT=4000

# 5️⃣ Migrate DB
cd apps/api
pnpm prisma migrate dev

# 6️⃣ Start both apps
pnpm start:all
