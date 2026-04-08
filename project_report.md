# Project Report: TeachDeck

## 1. Project Overview
**Project Name:** TeachDeck
**Team Name:** Xcess Denied
**Team Members:** Akshay Saxena, Dhruv Bajpai
**Live Deployment:** [https://teachdeck.vercel.app/](https://teachdeck.vercel.app/)

TeachDeck is an advanced, serverless, browser-native AI Teacher Copilot designed to revolutionize how educators grade handwritten and digital student assignments. By pushing the boundaries of edge-computing and direct API interfacing, TeachDeck completely eliminates the need for expensive, latency-heavy backend infrastructure while delivering premium, cinematic user experiences.

---

## 2. Problem Statement
Traditional digital grading systems suffer from several bottlenecks:
1. **Infrastructure Costs:** Processing Optical Character Recognition (OCR) and running Large Language Models (LLMs) typically require massive, centralized GPU servers.
2. **Speed & Latency:** Uploading heavy images to a server, waiting for a queue, and downloading a response causes friction for teachers with hundreds of papers.
3. **Rigid Evaluation:** Most auto-graders only look for exact multiple-choice matches and fail to holistically grade open-ended, handwritten conceptual maps or essays.

---

## 3. The TeachDeck Solution
TeachDeck democratizes AI tooling for classrooms by moving both the **extraction** and the **intelligence** directly to the user's browser, creating a fully Serverless Architecture.

### Core Mechanisms:
- **Browser-Native Extraction:** Instead of uploading a student's handwritten JPG or PDF to a server, TeachDeck uses mathematically optimized WebAssembly libraries (`tesseract.js` and `pdfjs-dist`) to read handwriting and extract document text locally on the teacher's machine.
- **Hyper-Fast Edge Inference:** The extracted raw text is then routed securely to **Groq's Llama-3 API**, which runs at unprecedented token generation speeds.
- **Deterministic Cognitive Mapping:** TeachDeck doesn't just ask the AI for a summary. It rigorously enforces a strict JSON schema, forcing the Llama-3 model to isolate missing keywords, identify grammatical structure flaws, and rewrite perfected sentences instantly.

---

## 4. Key Features & Modules

### Phase 1: Teacher Studio (Granular Multi-Question Grading)
Teachers can dynamically add an array of exact test questions and map required keywords to each. Upon uploading a student's answer sheet, TeachDeck intelligently maps the single raw document block to the array of questions, independently grading each sector and highlighting exact missing factors.

### Phase 2: Holistic Feedback UI 
A completely independent, beautifully isolated diagnostic tool. By uploading any student document, the AI bypasses granular grading and performs a sweeping generalized evaluation. It outputs an exact mapping of what the student's conceptual strengths are, and what mechanical areas they need to improve upon.

### Phase 3: Cinematic Aesthetics (WebGL & Glassmorphism)
TeachDeck proves that utility tools do not need to look boring. 
- Integrated **Three.js Cybernetic & Spooky Smoke Shaders** provide reactive, dynamic `<canvas>` backgrounds that respond to mouse movement.
- Highly optimized Tailwind CSS **Glassmorphism** overlays.

---

## 5. Technology Stack
- **Frontend Framework:** React.js 18 + Vite 5 (For highly optimized bundle delivery)
- **Styling Architecture:** Tailwind CSS + custom CSS animations (`.liquid-glass`, `animate-fade-rise`).
- **Intelligence Layer:** Groq AI Engine (`llama-3.1-8b-instant`).
- **Data Engineering:** `tesseract.js` (Handwriting reading), `pdfjs-dist` (Document parsing).
- **Graphics Rendering:** WebGL `three.js` (Interactive UI Shaders).
- **Hosting:** Vercel

---

## 6. Conclusion and Future Scope
TeachDeck successfully proves that high-performance, complex educational AI workflows can be executed entirely client-side, dramatically reducing overhead server costs down to zero. In the future, Team Xcess Denied plans to introduce `localStorage` synchronization to allow teachers to save historical classroom data persistently across browser sessions without needing a database.
