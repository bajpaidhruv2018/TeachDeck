import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import CyberneticGridShader from './components/ui/cybernetic-grid-shader';
import { SmokeBackground } from './components/ui/spooky-smoke-animation';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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
          <li><span onClick={() => setView('feedback')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Feedback</span></li>
          <li><span onClick={() => setView('about')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</span></li>
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
function TeacherStudio({ setView, results, setResults }) {
  const [criteria, setCriteria] = useState([{ id: Date.now(), question: "", keywords: "" }]);
  const [files, setFiles] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState(null);
  const [expandedFile, setExpandedFile] = useState(null);
  
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
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const gradeOneFile = async (singleFile) => {
    let studentText = "";
    const ext = singleFile.name.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      const result = await Tesseract.recognize(singleFile, 'eng');
      studentText = result.data.text.trim();
    } else if (ext === 'pdf') {
      studentText = await extractTextFromPDF(singleFile);
    } else {
      throw new Error(`Unsupported file format for "${singleFile.name}". Please upload PDF, JPG, or PNG.`);
    }

    if (!studentText) throw new Error(`No readable text found in "${singleFile.name}".`);

    const criteriaInstruction = criteria.map((c, i) => {
      const kw = c.keywords.trim();
      return `Question ${i+1}: "${c.question.trim()}"${kw ? ` | Required Keywords: [${kw.split(',').map(k => `"${k.trim()}"`).join(', ')}]` : ' | Required Keywords: none'}`;
    }).join("\n");

    const systemPrompt = `You are a deterministic exam grading engine. Your ONLY job is keyword matching and grammar checking. You do NOT give your own opinion on correctness — correctness is determined SOLELY by whether the required keywords appear in the student's text.

STRICT RULES:
1. For each question, extract the student's answer text from the raw OCR block.
2. Check if each required keyword appears in the extracted answer. Use case-insensitive matching. Accept minor OCR typos (1-2 character differences) as a match.
3. A keyword is FOUND if it appears in the answer (even with minor typos). A keyword is MISSING only if it truly does not appear anywhere in the answer.
4. For groq_feedback: If missing_keywords is empty (all keywords found), you MUST write "The answer is correct. All required keywords were identified." — no exceptions. If missing_keywords is non-empty, explain which concepts are missing.
5. GRAMMAR RULES — BE EXTREMELY CONSERVATIVE:
   - Default has_error to false. Only set true for CLEAR, OBVIOUS grammatical errors like wrong verb tense, subject-verb disagreement, or sentence fragments.
   - The text comes from OCR. Do NOT flag OCR artifacts (merged words, extra spaces, missing punctuation, odd capitalization) as grammar errors.
   - Do NOT flag informal or simple writing style as errors.
   - Do NOT flag missing articles (a, an, the) as errors — OCR often drops them.
   - error_words must contain ONLY the exact misspelled/incorrect words copied from the student text. If you cannot point to a specific wrong word, set has_error to false and error_words to [].
   - When in doubt, set has_error to false.
6. NEVER contradict the keyword arrays. If found_keywords contains all required keywords, the answer IS correct.

Respond ONLY with valid JSON.`;

    const userPrompt = `Grade the following exam submission.

GRADING CRITERIA:
${criteriaInstruction}

STUDENT'S RAW OCR TEXT:
"""
${studentText}
"""

Return a JSON object with this exact schema:
{
  "final_verdict": "string — 3-4 sentence overall evaluation. Focus on what the student should study or improve. If all questions have all keywords found, acknowledge strong performance.",
  "grades": [
    {
      "question_number": 1,
      "extracted_student_answer": "the exact sentences from the OCR text that answer this question",
      "found_keywords": ["list ONLY keywords from the Required Keywords list that appear in the answer"],
      "missing_keywords": ["list ONLY keywords from the Required Keywords list that do NOT appear in the answer"],
      "groq_feedback": "If missing_keywords is empty → 'The answer is correct. All required keywords were identified.' Otherwise explain what's missing.",
      "has_error": false,
      "error_words": [],
      "correction": "grammar-corrected version of the student's answer"
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
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0,
          response_format: { type: "json_object" }
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(`Groq API Error for "${singleFile.name}": ${errData.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const parsedData = JSON.parse(data.choices[0].message.content);

    // ── Client-side post-processing: override LLM feedback to guarantee consistency ──
    if (parsedData.grades && Array.isArray(parsedData.grades)) {
      parsedData.grades = parsedData.grades.map((grade, idx) => {
        const teacherKeywords = criteria[idx]?.keywords
          ?.split(',')
          .map(k => k.trim().toLowerCase())
          .filter(Boolean) || [];

        if (teacherKeywords.length === 0) {
          // No keywords were required — answer is correct by default
          return { ...grade, found_keywords: [], missing_keywords: [], groq_feedback: grade.groq_feedback || "No keywords were required. Review the answer qualitatively." };
        }

        // Re-derive found/missing from the extracted answer to catch LLM mistakes
        const answerLower = (grade.extracted_student_answer || "").toLowerCase();
        const recomputedFound = [];
        const recomputedMissing = [];

        for (const kw of teacherKeywords) {
          // Exact substring match (case-insensitive)
          if (answerLower.includes(kw)) {
            recomputedFound.push(kw);
          } else {
            // Fuzzy: check if any word in the answer is within edit-distance 2
            const answerWords = answerLower.split(/\s+/);
            const isFuzzyMatch = answerWords.some(word => {
              if (Math.abs(word.length - kw.length) > 2) return false;
              let diff = 0;
              const shorter = word.length < kw.length ? word : kw;
              const longer = word.length < kw.length ? kw : word;
              for (let i = 0; i < shorter.length; i++) {
                if (shorter[i] !== longer[i]) diff++;
              }
              diff += longer.length - shorter.length;
              return diff <= 2;
            });
            if (isFuzzyMatch) {
              recomputedFound.push(kw);
            } else {
              recomputedMissing.push(kw);
            }
          }
        }

        // Override the LLM's arrays with our deterministic computation
        const isCorrect = recomputedMissing.length === 0;

        // ── Grammar post-processing: validate error_words actually exist in the answer ──
        let validatedErrorWords = [];
        if (grade.error_words && Array.isArray(grade.error_words)) {
          validatedErrorWords = grade.error_words.filter(word => {
            if (!word || typeof word !== 'string') return false;
            // The error word must actually appear in the student's answer
            return answerLower.includes(word.toLowerCase());
          });
        }
        const hasRealError = validatedErrorWords.length > 0;

        return {
          ...grade,
          found_keywords: recomputedFound,
          missing_keywords: recomputedMissing,
          has_error: hasRealError,
          error_words: validatedErrorWords,
          correction: hasRealError ? grade.correction : (grade.extracted_student_answer || grade.correction),
          groq_feedback: isCorrect
            ? "The answer is correct. All required keywords were identified."
            : `Incomplete — missing keyword${recomputedMissing.length > 1 ? 's' : ''}: ${recomputedMissing.join(', ')}. ${grade.groq_feedback || ''}`
        };
      });
    }

    parsedData.original_text = studentText;
    parsedData.file_name = singleFile.name;
    return parsedData;
  };

  const submitGrading = async () => {
    if (files.length === 0 || criteria.some(c => !c.question.trim())) return;
    setIsLoading(true);
    setResults(null);
    setError(null);
    
    try {
      const allResults = [];
      for (let i = 0; i < files.length; i++) {
        setLoadingText(`Processing file ${i + 1} of ${files.length}: ${files[i].name}`);
        const result = await gradeOneFile(files[i]);
        allResults.push(result);
      }
      setResults(allResults);
      setExpandedFile(0);
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
              <li><span onClick={() => setView('feedback')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Feedback</span></li>
              <li><span onClick={() => setView('about')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</span></li>
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

                <h2 className="mb-6 mt-10 font-display text-2xl text-white">2. Upload Student Answers</h2>
                <div 
                  className={`upload-zone ${isHovering ? 'dragover' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                  onDragLeave={() => setIsHovering(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="upload-icon text-4xl mb-4">📄</div>
                  <p className="text-white">Drag & Drop PDFs, JPGs, or PNGs here</p>
                  <p className="sub-text mt-2">or click to browse — select multiple files</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".pdf, .jpg, .jpeg, .png" 
                    multiple
                    hidden 
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        setFiles(prev => [...prev, ...Array.from(e.target.files)]);
                      }
                    }}
                  />
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-neon-blue font-medium text-sm">{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                        className="text-red-400 hover:text-red-300 text-xs transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 group hover:border-neon-blue/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-neon-blue text-xs font-mono opacity-60">{String(i + 1).padStart(2, '0')}</span>
                          <span className="text-white text-sm truncate">{f.name}</span>
                          <span className="text-muted-foreground text-xs">({(f.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="text-muted-foreground hover:text-red-400 text-sm ml-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <button 
                  className="studio-btn mt-6 w-full py-4 text-lg font-semibold text-white rounded-xl active-sign-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={files.length === 0 || criteria.some(c => !c.question.trim()) || isLoading}
                  onClick={submitGrading}
                >
                  {isLoading ? "Running AI Grading..." : `Grade ${files.length || ''} File${files.length !== 1 ? 's' : ''}`}
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
                      <h2 className="font-display text-3xl text-white mb-2">Grade Reports</h2>
                      <p className="text-muted-foreground mb-8">{results.length} file{results.length !== 1 ? 's' : ''} evaluated</p>

                      {results.map((fileResult, fileIndex) => (
                        <div key={fileIndex} className="mb-6">
                          {/* File Header — clickable to expand/collapse */}
                          <button 
                            onClick={() => setExpandedFile(expandedFile === fileIndex ? null : fileIndex)}
                            className="w-full flex items-center justify-between p-5 rounded-xl bg-white/5 border border-white/10 hover:border-neon-blue/40 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-neon-blue font-mono text-sm opacity-70">{String(fileIndex + 1).padStart(2, '0')}</span>
                              <span className="text-white font-semibold text-lg">{fileResult.file_name}</span>
                              {fileResult.grades && (
                                <span className="text-xs px-2 py-1 rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                                  {fileResult.grades.filter(g => g.found_keywords?.length > 0 && g.missing_keywords?.length === 0).length}/{fileResult.grades.length} correct
                                </span>
                              )}
                            </div>
                            <span className={`text-muted-foreground transition-transform duration-300 ${expandedFile === fileIndex ? 'rotate-180' : ''}`}>▼</span>
                          </button>

                          {/* Expanded File Results */}
                          {expandedFile === fileIndex && (
                            <div className="mt-4 ml-4 pl-6 border-l-2 border-neon-blue/20 animate-[fade-rise_0.3s_ease-out]">
                              <div className="mb-8 p-4 bg-black/20 rounded-lg">
                                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Raw Extracted Text Pipeline:</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{fileResult.original_text}</p>
                              </div>
                              
                              {fileResult.grades && fileResult.grades.map((grade, index) => (
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

                              {fileResult.final_verdict && (
                                <div className="mt-12 pt-8 border-t border-white/20">
                                  <h3 className="font-display text-3xl text-neon-purple mb-6">Journal: Final Verdict</h3>
                                  <div className="result-block bg-black/40 p-6 rounded-xl border border-neon-purple/30 shadow-[0_0_15px_rgba(157,75,255,0.15)]">
                                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold" style={{ color: 'var(--neon-purple)' }}>Overall Improvement Feedback:</h4>
                                    <p className="text-white text-lg leading-relaxed">{fileResult.final_verdict}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
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
// STUDENT FEEDBACK VIEW
// ==========================================
function StudentFeedback({ setView }) {
  const [file, setFile] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [generalFeedback, setGeneralFeedback] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const evaluateGeneralSubmission = async () => {
    if (!file) return;
    setIsLoading(true);
    setGeneralFeedback(null);
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

      setLoadingText("Running Generalized AI Evaluation...");
      
      const prompt = `You are an elite Teacher Copilot evaluating a student's submission.
The student submitted the following raw OCR text:
'${studentText}'

Analyze the student answer block holistically. Provide general feedback detailing:
1. What the student is good at (strengths, good mechanics, logical flow, etc.)
2. What the student needs to improve on (weaknesses, grammar, conceptual misunderstandings)

You MUST respond ONLY with a valid JSON object matching this exact schema:
{
  "strengths": "string, 3-4 sentences detailing what the student is doing well.",
  "improvements": "string, 3-4 sentences detailing what mechanics or concepts they need to improve upon."
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
      setGeneralFeedback(parsedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-main flex flex-col items-center justify-center p-8 overflow-y-auto">
      <SmokeBackground smokeColor="#9D4BFF" />
      
      <nav className="fixed top-0 z-20 flex flex-row items-center justify-between px-8 py-6 w-full max-w-7xl">
        <div 
          className="text-3xl tracking-tight text-foreground cursor-pointer"
          style={{ fontFamily: "var(--font-display)" }}
          onClick={() => setView('home')}
        >
          TeachDeck<sup className="text-xs">®</sup>
        </div>
        
        <ul className="hidden md:flex flex-row gap-8 items-center cursor-pointer">
          <li><span onClick={() => setView('home')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Home</span></li>
          <li><span onClick={() => setView('studio')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Studio</span></li>
          <li><span onClick={() => setView('feedback')} className="text-sm text-foreground transition-colors hover:text-foreground">Feedback</span></li>
          <li><span onClick={() => setView('about')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</span></li>
        </ul>

        <button 
          onClick={() => setView('studio')} 
          className="text-sm text-foreground hover:text-neon-purple transition-colors duration-300"
        >
          Return to Studio →
        </button>
      </nav>

      <div className="relative z-10 w-full max-w-3xl pt-24 pb-16">
        {!generalFeedback && !isLoading && (
            <div className="glass-card p-12 text-center animate-[fade-rise_0.6s_ease-out]">
              <h1 className="font-display text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Holistic Grading</h1>
              <p className="text-muted-foreground mb-8">Upload any document. We'll tell you what they're good at, and what needs work.</p>
              
              <div 
                className={`upload-zone border-neon-purple/30 shadow-[0_0_15px_rgba(157,75,255,0.1)] ${isHovering ? 'dragover' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                onDragLeave={() => setIsHovering(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon text-4xl mb-4">📄</div>
                <p className="text-white">Drag & Drop a PDF, JPG, or PNG here</p>
                <p className="sub-text mt-2 text-neon-purple">or click to browse files</p>
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
              
              {file && <div className="file-name text-neon-purple font-medium text-center my-4">Selected: {file.name}</div>}
              
              <button 
                className="studio-btn mt-6 w-full py-4 text-lg font-semibold text-white rounded-xl active-sign-glow shadow-[0_0_15px_rgba(157,75,255,0.4)] border-neon-purple disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={!file}
                onClick={evaluateGeneralSubmission}
              >
                Generate General Feedback
              </button>
              {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </div>
        )}

        {isLoading && (
            <div className="glass-card p-12 text-center py-20 animate-[fade-rise_0.6s_ease-out]">
                <div className="spinner mx-auto mb-6" style={{ borderColor: "rgba(157,75,255,0.2)", borderTopColor: "var(--neon-purple)" }}></div>
                <p className="text-white text-lg">{loadingText}</p>
                <p className="text-neon-purple mt-2 text-sm opacity-70">Llama 3 Instruct</p>
            </div>
        )}

        {generalFeedback && !isLoading && (
            <div className="glass-card p-12 animate-[fade-rise_0.6s_ease-out]">
                <h1 className="font-display text-5xl mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 text-center">Evaluation Complete</h1>
                
                <div className="space-y-8">
                    <div className="result-block bg-black/40 p-6 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <h4 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-4">Strengths & Capabilities</h4>
                        <p className="text-white text-lg leading-relaxed">{generalFeedback.strengths}</p>
                    </div>

                    <div className="result-block bg-black/40 p-6 rounded-xl border border-neon-purple/30 shadow-[0_0_15px_rgba(157,75,255,0.15)]">
                        <h4 className="text-xs uppercase tracking-wider text-neon-purple font-semibold mb-4">Areas for Improvement</h4>
                        <p className="text-white text-lg leading-relaxed">{generalFeedback.improvements}</p>
                    </div>

                    <div className="pt-8 mt-8 border-t border-white/10 flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Generated by Llama 3 Instruct</span>
                        <button 
                            onClick={() => { setGeneralFeedback(null); setFile(null); }}
                            className="text-neon-purple hover:text-white transition-colors"
                        >
                            Evaluate Another File →
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ABOUT TEAM VIEW
// ==========================================
function AboutTeam({ setView }) {
  return (
    <div className="relative min-h-screen text-main flex flex-col items-center justify-center p-8 overflow-y-auto">
      <nav className="fixed top-0 z-20 flex flex-row items-center justify-between px-8 py-6 w-full max-w-7xl">
        <div 
          className="text-3xl tracking-tight text-foreground cursor-pointer"
          style={{ fontFamily: "var(--font-display)" }}
          onClick={() => setView('home')}
        >
          TeachDeck<sup className="text-xs">®</sup>
        </div>
        
        <ul className="hidden md:flex flex-row gap-8 items-center cursor-pointer">
          <li><span onClick={() => setView('home')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Home</span></li>
          <li><span onClick={() => setView('studio')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Studio</span></li>
          <li><span onClick={() => setView('feedback')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Feedback</span></li>
          <li><span onClick={() => setView('about')} className="text-sm text-foreground transition-colors hover:text-foreground">About</span></li>
        </ul>

        <button 
          onClick={() => setView('home')} 
          className="text-sm text-foreground hover:text-neon-purple transition-colors duration-300"
        >
          Back to Home →
        </button>
      </nav>

      <div className="relative z-10 w-full max-w-3xl pt-24 pb-16">
        <div className="glass-card p-12 animate-[fade-rise_0.6s_ease-out]">
          <h1 className="font-display text-5xl mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 text-center">Our Mission</h1>
          <p className="text-neon-purple font-semibold text-lg mb-10 text-center uppercase tracking-widest">Team Xcess Denied</p>
          
          <div className="space-y-8 text-left">
              <div className="result-block bg-black/40 p-6 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <h4 className="text-xs uppercase tracking-wider font-semibold mb-4 text-neon-blue">The Creators</h4>
                  <ul className="text-muted-foreground space-y-2 list-none">
                      <li className="flex items-center"><span className="text-neon-blue mr-3">✦</span> Akshay Saxena</li>
                      <li className="flex items-center"><span className="text-neon-blue mr-3">✦</span> Dhruv Bajpai</li>
                  </ul>
              </div>

              <div className="result-block bg-black/40 p-6 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <h4 className="text-xs uppercase tracking-wider font-semibold mb-4 text-neon-purple">Solution</h4>
                  <p className="text-muted-foreground leading-relaxed">
                      we have made teachers dashboard which basically which adds questions from teacher and map keywords which teacher seeks in answer , then if the answer is grammitically correct and has all keywords it shows answer as correct and also in feedback section it shows student skill and what he lacks.
                  </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ROOT APP VIEW MANAGER
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [results, setResults] = useState(null);

  return (
    <>
      {currentView === 'home' && <LandingPage setView={setCurrentView} />}
      {currentView === 'studio' && <TeacherStudio setView={setCurrentView} results={results} setResults={setResults} />}
      {currentView === 'feedback' && <StudentFeedback setView={setCurrentView} results={results} />}
      {currentView === 'about' && <AboutTeam setView={setCurrentView} />}
    </>
  );
}
