# Vokely.io

Welcome to the Vokely.io repository! This open-source project is an AI-powered Career platform built for job seekers. The project is a full-stack application split into a **Next.js** frontend and a **FastAPI** backend.

## 🚀 Tech Stack

### Frontend (`/client`)

- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS, Framer Motion, GSAP, Radix UI
- **State Management**: Zustand

### Backend (`/server`)

- **Framework**: FastAPI (Python)
- **Database**: MongoDB (via Motor)
- **Caching**: Redis
- **AI/LLMs**: OpenAI, Google Generative AI (Gemini), Groq, DeepSeek, Llama
- **Utilities**: SpaCy (NLP), PyMuPDF / PyTesseract (OCR), python-docx

---

## 🛠️ Setting up the Development Environment

Follow these steps to set up the project locally for development.

### Prerequisites

- **Node.js**: v18+
- **Python**: v3.10+
- **MongoDB**: Local instance or MongoDB Atlas
- **Redis**: Local instance or cloud Redis

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vokely.io.git
cd vokely.io
```

---

### 2. Backend Setup (`/server`)

The backend is a FastAPI application that handles AI processing, database operations, and external API integrations.

1. **Navigate to the server directory**:

   ```bash
   cd server
   ```

2. **Create and activate a virtual environment**:

   ```bash
   python -m venv venv
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   # venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

   _Note: You must also install the required NLP models for SpaCy, which is used for ATS resume analysis._

   ```bash
   pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl
   ```

4. **Environment Variables**:
   Copy the example environment file and fill in your API keys (MongoDB, Gemini, Groq, etc.).

   ```bash
   cp .env.example .env
   ```

5. **Start the FastAPI server**:
    ```bash
   cd app
   ```
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   _The backend API will be running at `http://localhost:8000`. You can view the interactive API docs at `http://localhost:8000/docs`._

---

### 3. Frontend Setup (`/client`)

The frontend is a Next.js application with a modern UI relying on Tailwind CSS and Framer Motion.

1. **Open a new terminal and navigate to the client directory**:

   ```bash
   cd client
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or with yarn: yarn install
   ```

3. **Environment Variables**:
   Copy the example environment file.

   ```bash
   cp .env.example .env.local
   ```

   _Ensure that `NEXT_PUBLIC_API_URL` or `API_URL` correctly points to your local backend (e.g., `http://localhost:8000/app`). You will also need to configure any OAuth keys (Google, LinkedIn) if you plan to use those features._

4. **Start the Next.js development server**:

   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Visit [http://localhost:3000](http://localhost:3000) to view the application!

---

## 🤝 Contributing

We welcome contributions from the community! Feel free to open issues or submit pull requests for bug fixes, features, or documentation improvements.

## 📄 License

This project is licensed under the MIT License.
