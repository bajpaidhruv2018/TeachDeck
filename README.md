# TeachDeck 🎓

![TeachDeck Dashboard](https://img.shields.io/badge/Status-Active-success) ![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Groq](https://img.shields.io/badge/Powered_by-Groq_Llama_3-orange)

🚀 **Live Deployment**: [https://teachdeck.vercel.app/](https://teachdeck.vercel.app/)

**TeachDeck** is a serverless, browser-native AI Teacher Copilot designed to automate the grading of handwritten student assignments. 

By leveraging the speed of **Groq's Llama-3 API** entirely on the frontend, TeachDeck eliminates the need for expensive backends. It processes images via client-side OCR and evaluates handwritten answers against teacher-defined keywords with hyper-fast intelligence.

---

## ✨ Features

- 🎥 **Cinematic User Experience**: Features a visually stunning, glassmorphic Landing Page with a looped video background and Tailwind CSS styling.
- ⚡ **Serverless Architecture**: All heavy lifting runs perfectly in the browser! No Python, Flask, or backend databases required.
- 📝 **Browser-Native OCR**: Uses `tesseract.js` to mathematically read handwritten student answers directly from uploaded JPGs/PNGs without making external structural API calls.
- 📑 **PDF Extraction**: Uses `pdfjs-dist` to seamlessly extract text from multi-page document uploads.
- 🧠 **Groq Llama-3 AI Grading**: Performs high-speed fuzzy matching on handwritten OCR text. Capable of accurately mapping missing/found keywords, providing conceptual feedback, identifying grammatical errors, and rewriting perfected sentences.
- 📊 **Holistic Feedback UI**: An independent diagnostic module where teachers can drop any document. Generates a generalized evaluation explicitly detailing the student's conceptual strengths and areas for improvement instantly.
- 🔮 **Interactive WebGL Shaders**: Implements custom Three.js `cybernetic-grid` and `spooky-smoke` dynamic canvas shaders across the dashboard for an immersive, cinematic visual experience.

## 🛠️ Tech Stack

- **Frontend Core**: React 18 + Vite 5
- **Styling**: Tailwind CSS + Custom CSS Keyframes (Glassmorphism)
- **AI Processing**: Groq API (`llama-3.1-8b-instant`) strictly enforced via JSON templating.
- **Data Parsing**: Tesseract.js (Images), PDF.js (Documents)
- **WebGL Assets**: Three.js

## 🚀 Getting Started

### Prerequisites
You will need Node.js installed and a valid API key from [Groq](https://console.groq.com/keys).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bajpaidhruv2018/TeachDeck.git
   cd TeachDeck
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Groq key:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173` to view the TeachDeck application!

## 💡 How to Use

1. Click **Begin Journey** on the Cinematic Landing Page to enter the **Studio**.
2. **Grading Criteria**: Input the exact exam question. Optionally, input comma-separated required **Keywords**.
3. **Upload Student Answer**: Drag and drop a student's handwritten JPG or a typed PDF document.
4. **Run AI Grading**: TeachDeck will extract the text, perform layout analysis, and interface with Llama-3 to grade the concept. It strictly matches against your keywords and outputs grammar corrections directly onto your dashboard.

---

## 👥 About Us

**Team Name:** Xcess Denied

**Members:**
- Akshay Saxena
- Dhruv Bajpai

### Solution
we have made teachers dashboard which basically which adds questions from teacher and map keywords which teacher seeks in answer , then if the answer is grammitically correct and has all keywords it shows answer as correct and also in feedback section it shows student skill and what he lacks.
