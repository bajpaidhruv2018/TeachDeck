import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import CyberneticGridShader from './components/ui/cybernetic-grid-shader';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// ==========================================
// LANDING PAGE VIEW
// ==========================================
function LandingPage({ setView }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
      />

      {/* Navigation Bar */}
      <nav className="relative z-10 flex flex-row items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div 
          onClick={() => setView('home')}
          className="text-3xl tracking-tight text-foreground cursor-pointer"
          style={{ fontFamily: "var(--font-display)" }}
        >
          TeachDeck<sup className="text-xs">®</sup>
        </div>
        
        <ul className="hidden md:flex flex-row gap-8 items-center cursor-pointer">
          <li><span onClick={() => setView('home')} className="text-sm text-foreground transition-colors hover:text-foreground">Home</span></li>
          <li><span onClick={() => setView('studio')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Studio</span></li>
          <li><span className="text-sm text-muted-foreground transition-colors hover:text-foreground">Journal</span></li>
          <li><span className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</span></li>
        </ul>

        <button 
          onClick={() => setView('studio')} 
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform duration-300 pointer-events-auto"
        >
          Begin Journey
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 min-h-[calc(100vh-100px)] pointer-events-none">
        <h1 
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-foreground animate-fade-rise"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Where <em className="not-italic text-muted-foreground">dreams</em> rise <em className="not-italic text-muted-foreground">through the silence.</em>
        </h1>
        
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>

        <button 
          onClick={() => setView('studio')}
          className="liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] cursor-pointer transition-transform duration-300 animate-fade-rise-delay-2 pointer-events-auto"
        >
          Begin Journey
        </button>
      </main>
    </div>
  );
}

// ==========================================
// TEACHER COPILOT DASHBOARD VIEW
// ==========================================
function TeacherStudio({ setView }) {
  const [criteria, setCriteria] = useState([{ id: Date.now(), question: "", keywords: "" }]);
  const [file, setFile] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const addQuestion = () => {
    setCriteria([...criteria, { id: Date.now(), question: "", keywords: "" }]);
  };

  const removeQuestion = (id) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const updateCriteria = (id, field, value) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const extractTextFromPDF = async (pdfFile) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(s => s.str).join(" ") + " ";
    }
    return fullText.trim();
  };

  const submitGrading = async () => {
    if (!file || criteria.some(c => !c.question.trim())) return;
    setIsLoading(true);
    setResults(null);
    setError(null);
    
    try {
      let studentText = "";
      const ext = file.name.split('.').pop().toLowerCase();
      
      setLoadingText("Extracting Text from Document...");
      if (['jpg', 'jpeg', 'png'].includes(ext)) {
        const result = await Tesseract.recognize(file, 'eng');
        studentText = result.data.text.trim();
      } else if (ext === 'pdf') {
        studentText = await extractTextFromPDF(file);
      } else {
        throw new Error("Unsupported file format. Please upload PDF, JPG, or PNG.");
      }

      if (!studentText) throw new Error("No readable text found in the document.");

      setLoadingText("Running Llama 3 Evaluation...");
      const criteriaInstruction = criteria.map((c, i) => 
        `Question ${i+1}: '${c.question.trim()}' (Required Keywords: '${c.keywords.trim()}')`
      ).join("\n");

      const prompt = `You are an elite Teacher Copilot grading an exam.
The teacher has provided the following grading criteria mapping out multiple questions:
${criteriaInstruction}

The student submitted the following raw OCR text (which contains the answers to all questions in a single block):
'${studentText}'

Analyze the student answer block and intelligently map the relevant text to each question. Perform conceptual accuracy grading AND verify grammar for each mapped answer.
CRITICAL TEACHING RULE: If the student's mapped text contains ALL required keywords for a question (use fuzzy matching for OCR typos), you MUST state the answer is completely correct in your feedback for that specific question. If ANY are missing, state it is incorrect.

You MUST respond ONLY with a valid JSON object matching this exact schema:
{
  "final_verdict": "string, a 3-4 sentence comprehensive final evaluation across all questions, specifically detailing exactly what concepts or mechanics the student needs to improve upon overall.",
  "grades": [
    {
      "question_number": int,
      "extracted_student_answer": "string, the specific sentences from the raw student text that answer this question",
      "found_keywords": ["only list strings from the teacher's required keywords that you found. Return [] if none."],
      "missing_keywords": ["only list strings from the teacher's required keywords that were missing. Return [] if none."],
      "groq_feedback": "string, 1-2 sentences. If all keywords are found, definitively state 'The answer is correct.'",
      "has_error": boolean, true ONLY if there are grammatical/spelling errors in this specific answer. Do NOT set to true just because a keyword missed.,
      "error_words": ["list exact misspelled grammatical words found. Leave empty [] if none."],
      "correction": "string, the perfectly grammar-corrected version of their sentence."
    }
  ]
}`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            response_format: { type: "json_object" }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(`Groq API Error: ${errData.error?.message || res.statusText}`);
      }

      const data = await res.json();
      const parsedData = JSON.parse(data.choices[0].message.content);
      parsedData.original_text = studentText;
      setResults(parsedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="studio-layer min-h-screen text-main">
          {/* Studio Top Navigation */}
          <nav className="relative z-10 flex flex-row items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
            <div 
              className="text-3xl tracking-tight text-foreground cursor-pointer"
              style={{ fontFamily: "var(--font-display)" }}
              onClick={() => setView('home')}
            >
              TeachDeck<sup className="text-xs">®</sup>
            </div>
            
            <ul className="hidden md:flex flex-row gap-8 items-center cursor-pointer">
              <li><span onClick={() => setView('home')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Home</span></li>
              <li><span onClick={() => setView('studio')} className="text-sm text-foreground transition-colors hover:text-foreground">Studio</span></li>
              <li><span className="text-sm text-muted-foreground transition-colors hover:text-foreground">Journal</span></li>
              <li><span className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</span></li>
            </ul>

            <button 
              onClick={() => setView('home')} 
              className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform duration-300"
            >
              Back to Home
            </button>
          </nav>

          <div className="background-orbs z-0">
             <CyberneticGridShader />
          </div>

          <div className="container relative z-10 pt-8 pb-32 max-w-3xl mx-auto">
            <header className="text-center mb-12">
              <h1 className="gradient-text">Teacher Copilot</h1>
              <p className="text-muted-foreground text-lg mt-2">Serverless Grading via Groq API</p>
            </header>

            <main>
              <section className="glass-card input-section">
                <h2 className="mb-6 font-display text-2xl text-white">1. Grading Criteria</h2>
                
                {criteria.map((c, index) => (
                  <div key={c.id} className="mb-6 p-4 border border-white/10 rounded-xl relative bg-black/10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-neon-blue font-semibold">Question {index + 1}</h3>
                      {criteria.length > 1 && (
                        <button onClick={() => removeQuestion(c.id)} className="text-red-400 hover:text-red-300 text-sm">
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="input-group mb-4">
                      <label className="block mb-2 text-muted-foreground text-sm">What was the exam question?</label>
                      <input 
                        type="text" 
                        value={c.question}
                        onChange={e => updateCriteria(c.id, 'question', e.target.value)}
                        placeholder="e.g. What did the boy do yesterday?" 
                        autoComplete="off" 
                        style={{marginBottom: 0}}
                      />
                    </div>
                    
                    <div className="input-group" style={{marginBottom: 0}}>
                      <label className="block mb-2 text-muted-foreground text-sm">Required Keywords (optional, comma-separated)</label>
                      <input 
                        type="text" 
                        value={c.keywords}
                        onChange={e => updateCriteria(c.id, 'keywords', e.target.value)}
                        placeholder="e.g. store, walked, yesterday" 
                        autoComplete="off" 
                      />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addQuestion}
                  className="w-full py-3 mt-2 rounded-xl border-2 border-dashed border-white/20 text-muted-foreground hover:text-white hover:border-white/40 transition-colors"
                >
                  + Add Another Question
                </button>

                <h2 className="mb-6 mt-10 font-display text-2xl text-white">2. Upload Student Answer</h2>
                <div 
                  className={`upload-zone ${isHovering ? 'dragover' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                  onDragLeave={() => setIsHovering(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="upload-icon text-4xl mb-4">📄</div>
                  <p className="text-white">Drag & Drop a PDF, JPG, or PNG here</p>
                  <p className="sub-text mt-2">or click to browse files</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".pdf, .jpg, .jpeg, .png" 
                    hidden 
                    onChange={(e) => {
                      if (e.target.files?.length) setFile(e.target.files[0]);
                    }}
                  />
                </div>
                
                {file && <div className="file-name text-neon-blue font-medium text-center my-4">Selected: {file.name}</div>}
                
                <button 
                  className="studio-btn mt-6 w-full py-4 text-lg font-semibold text-white rounded-xl active-sign-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={!file || criteria.some(c => !c.question.trim()) || isLoading}
                  onClick={submitGrading}
                >
                  {isLoading ? "Running AI Grading..." : "Run AI Grading"}
                </button>
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
              </section>

              {(isLoading || results) && (
                <section className="glass-card results-section mt-12">
                  {isLoading && (
                    <div className="loading-overlay text-center py-12">
                      <div className="spinner mx-auto mb-6"></div>
                      <p className="text-white">{loadingText}</p>
                    </div>
                  )}
                  
                  {results && !isLoading && (
                    <div id="results-content">
                      <h2 className="font-display text-3xl text-white mb-2">Grade Report</h2>
                      <div className="mb-8 p-4 bg-black/20 rounded-lg">
                        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Raw Extracted Text Pipeline:</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{results.original_text}</p>
                      </div>
                      
                      {results.grades && results.grades.map((grade, index) => (
                        <div key={index} className="mb-12 last:mb-0 pb-8 border-b border-white/10 last:border-0 last:pb-0">
                          <h3 className="font-display text-2xl text-neon-blue mb-6">Question {grade.question_number} Results</h3>

                          <div className="result-block">
                              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Identified Answer Segment:</h4>
                              <p className="text-muted-foreground">"{grade.extracted_student_answer}"</p>
                          </div>

                          <div className="result-block highlight-block">
                              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Groq Conceptual Analysis:</h4>
                              {(grade.found_keywords?.length > 0 || grade.missing_keywords?.length > 0) && (
                                <div className="bg-black/20 p-4 rounded-lg mb-4 text-sm">
                                  {grade.found_keywords?.length > 0 && (
                                    <p className="mb-2">
                                      <strong className="text-neon-blue">Found Keywords:</strong> {grade.found_keywords.join(', ')}
                                    </p>
                                  )}
                                  {grade.missing_keywords?.length > 0 && (
                                    <p className="text-red-500">
                                      <strong className="text-neon-purple">Missing Keywords:</strong> {grade.missing_keywords.join(', ')}
                                    </p>
                                  )}
                                </div>
                              )}
                              <p className="text-white">{grade.groq_feedback}</p>
                          </div>

                          <div className="result-block">
                              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Grammar Status:</h4>
                              <p className={grade.has_error ? 'text-red-500' : 'text-emerald-500'}>
                                {grade.has_error ? "Warning - Grammatical structures are flagged." : "General sentence structure appears clear."}
                              </p>
                              {grade.error_words?.length > 0 && (
                                <ul className="mt-2 list-none space-y-1">
                                  {grade.error_words.map((word, i) => (
                                    <li key={i} className="text-red-500 pl-4 relative before:content-['!'] before:absolute before:left-0 before:font-bold">
                                      {word}
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </div>

                          <div className="result-block success-block">
                              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Perfected Rewrite:</h4>
                              <p className="text-white">{grade.correction}</p>
                          </div>
                        </div>
                      ))}

                      {results.final_verdict && (
                        <div className="mt-12 pt-8 border-t border-white/20">
                          <h3 className="font-display text-3xl text-neon-purple mb-6">Journal: Final Verdict</h3>
                          <div className="result-block bg-black/40 p-6 rounded-xl border border-neon-purple/30 shadow-[0_0_15px_rgba(157,75,255,0.15)]">
                            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold" style={{ color: 'var(--neon-purple)' }}>Overall Improvement Feedback:</h4>
                            <p className="text-white text-lg leading-relaxed">{results.final_verdict}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}
            </main>
          </div>
      </div>
  );
}

// ==========================================
// ROOT APP VIEW MANAGER
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <>
      {currentView === 'home' && <LandingPage setView={setCurrentView} />}
      {currentView === 'studio' && <TeacherStudio setView={setCurrentView} />}
    </>
  );
}
