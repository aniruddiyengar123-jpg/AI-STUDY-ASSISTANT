# AI Study Assistant (V1)

A clean, responsive, and secure full-stack AI Study Assistant designed to provide clear, structured, and pedagogical explanations for academic and programming concepts. Powered by FastAPI, NVIDIA's OpenAI-compatible API, and Next.js with TypeScript and Tailwind CSS.

---

## 🏛️ Architecture

```
Browser
  ↓
Next.js (http://localhost:3000)
  ↓
FastAPI POST /api/ask (http://localhost:8000)
  ↓
NVIDIA Hosted API (https://integrate.api.nvidia.com/v1)
  ↓
FastAPI
  ↓
Next.js
  ↓
User
```

### Directory Layout

```
ai-study-assistant/
├── frontend/              # Next.js + TypeScript + Tailwind CSS
│   ├── app/               # Next.js App Router (pages, layout, globals.css)
│   ├── components/        # UI components (Header, QuestionForm, AnswerCard, ErrorMessage)
│   ├── lib/               # Frontend API client
│   ├── types/             # TypeScript interfaces
│   ├── .env.example       # Frontend environment template
│   └── .env.local         # Frontend local environment
│
├── backend/               # FastAPI + Python
│   ├── app/
│   │   ├── main.py        # FastAPI entrypoint, CORS & error handlers
│   │   ├── routers/       # API route controllers (health, ask)
│   │   ├── services/      # NVIDIA API service integration
│   │   ├── models/        # Pydantic request/response schemas
│   │   └── config.py      # Pydantic Settings configuration
│   ├── tests/             # Pytest test suite
│   ├── .env.example       # Backend environment template
│   ├── .env               # Backend environment secrets
│   └── requirements.txt   # Python dependencies
│
├── .gitignore             # Secrets & build artifact ignore rules
└── README.md
```

---

## 🔒 Security Best Practices

1. **API Key Isolation**: `NVIDIA_API_KEY` exists **strictly in `backend/.env`** and is never exposed to the frontend or browser.
2. **No Public Key Leakage**: No `NEXT_PUBLIC_NVIDIA_API_KEY` is ever defined or used.
3. **CORS Protected**: FastAPI allows CORS origins explicitly for `http://localhost:3000`.
4. **Sanitized Error Responses**: Raw exceptions, stack traces, and internal secrets are caught and masked into friendly user-facing messages.
5. **Git Ignored Secrets**: `.env` and `.env.local` files are tracked in `.gitignore`.

---

## 🚀 Getting Started

### Prerequisites

- **Python**: 3.10+ (Tested on Python 3.11)
- **Node.js**: 18+ (Tested on Node v24)
- **NVIDIA API Key**: Obtainable from NVIDIA NGC / build.nvidia.com

---

### 1. Backend Setup & Execution

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and insert your NVIDIA API key:
   ```env
   NVIDIA_API_KEY=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
   NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
   NVIDIA_MODEL=meta/llama-3.1-8b-instruct
   CORS_ORIGINS=["http://localhost:3000"]
   PORT=8000
   HOST=0.0.0.0
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend will be running at `http://localhost:8000`.
   - Health check: `http://localhost:8000/`
   - Interactive Swagger API docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup & Execution

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify or create `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:3000`.

---

## 📡 API Specification

### 1. Health Check
- **Endpoint**: `GET /`
- **Response**:
  ```json
  {
    "status": "healthy",
    "service": "AI Study Assistant API",
    "version": "1.0.0"
  }
  ```

### 2. Ask Study Question
- **Endpoint**: `POST /api/ask`
- **Request Body**:
  ```json
  {
    "question": "What is a Python list?"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "answer": "A Python list is a built-in, ordered, and mutable collection of items...",
    "model": "meta/llama-3.1-8b-instruct"
  }
  ```
- **Error Response (400 / 502 / 503 / 504)**:
  ```json
  {
    "detail": "User-friendly error explanation"
  }
  ```

---

## 🧪 Testing

### Backend Unit & Integration Tests
Run pytest in the backend directory:
```bash
cd backend
.\venv\Scripts\pytest -v
```

### End-to-End Verification
1. Start backend on `http://localhost:8000`.
2. Start frontend on `http://localhost:3000`.
3. Open `http://localhost:3000` in your web browser.
4. Verify the header shows `Backend Connected`.
5. Enter a study question or click one of the preset prompts.
6. Click **Ask AI** and verify the loading spinner, educational response, code formatting, and clipboard copy features.
