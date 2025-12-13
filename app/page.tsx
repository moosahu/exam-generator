'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Plus, Trash2, Shuffle, Save, BookOpen } from 'lucide-react';

interface ExamInfo {
  title: string;
  subject: string;
  date: string;
  duration: string;
  totalMarks: string;
  semester: string;
  teacherName: string;
  schoolName: string;
  educationDept: string;
  educationOffice: string;
  grade: string;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

export default function ExamGenerator() {
  const [examInfo, setExamInfo] = useState<ExamInfo>({
    title: 'اختبار مادة',
    subject: '',
    date: '',
    duration: '',
    totalMarks: '',
    semester: '',
    teacherName: '',
    schoolName: '',
    educationDept: 'الإدارة العامة للتعليم بالمنطقة الشرقية',
    educationOffice: 'مكتب التعليم بالخبر',
    grade: ''
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    }
  ]);

  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showSubjectsPage, setShowSubjectsPage] = useState(false);
  const [showAddQuestionsPage, setShowAddQuestionsPage] = useState(false);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [tempQuestions, setTempQuestions] = useState<Question[]>([
    {
      id: 1,
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    }
  ]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [numModels, setNumModels] = useState(2);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      const data = await res.json();
      setSubjects(data.map((s: any) => s.name));
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const createNewSubject = () => {
    if (!newSubjectName.trim()) {
      alert('الرجاء إدخال اسم المادة');
      return;
    }
    setSelectedSubject(newSubjectName);
    setNewSubjectName('');
    setShowSubjectsPage(false);
    setShowAddQuestionsPage(true);
  };

  const loadSubjectQuestions = async (subjectName: string) => {
    try {
      const res = await fetch('/api/subjects');
      const subjects = await res.json();
      const subject = subjects.find((s: any) => s.name === subjectName);
      
      if (subject && subject.questions.length > 0) {
        const formattedQuestions = subject.questions.map((q: any) => ({
          id: Date.now() + Math.random(),
          text: q.text,
          options: [q.option1, q.option2, q.option3, q.option4],
          correctAnswer: q.correctAnswer,
          marks: q.marks
        }));
        setTempQuestions(formattedQuestions);
      } else {
        setTempQuestions([{
          id: Date.now(),
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          marks: 1
        }]);
      }
      
      setSelectedSubject(subjectName);
      setShowSubjectsPage(false);
      setShowAddQuestionsPage(true);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const saveQuestionBank = async () => {
    if (!selectedSubject.trim()) {
      alert('الرجاء تحديد اسم المادة');
      return;
    }

    try {
      // Create or get subject
      let subjectId;
      const subjectsRes = await fetch('/api/subjects');
      const existingSubjects = await subjectsRes.json();
      const existingSubject = existingSubjects.find((s: any) => s.name === selectedSubject);
      
      if (existingSubject) {
        subjectId = existingSubject.id;
      } else {
        const createRes = await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: selectedSubject })
        });
        const newSubject = await createRes.json();
        subjectId = newSubject.id;
      }

      // Save questions
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          questions: tempQuestions
        })
      });

      await loadSubjects();
      setTempQuestions([{
        id: Date.now(),
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1
      }]);
      setSelectedSubject('');
      setShowAddQuestionsPage(false);
      alert('تم حفظ بنك الأسئلة بنجاح!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const deleteSubject = async (subjectName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المادة: ${subjectName}؟`)) return;

    try {
      const res = await fetch('/api/subjects');
      const subjects = await res.json();
      const subject = subjects.find((s: any) => s.name === subjectName);
      
      if (subject) {
        await fetch(`/api/subjects?id=${subject.id}`, { method: 'DELETE' });
        await loadSubjects();
        alert('تم الحذف بنجاح');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const loadQuestionsForSelection = async (subjectName: string) => {
    try {
      const res = await fetch('/api/subjects');
      const subjects = await res.json();
      const subject = subjects.find((s: any) => s.name === subjectName);
      
      if (subject && subject.questions.length > 0) {
        const formattedQuestions = subject.questions.map((q: any) => ({
          id: Date.now() + Math.random(),
          text: q.text,
          options: [q.option1, q.option2, q.option3, q.option4],
          correctAnswer: q.correctAnswer,
          marks: q.marks
        }));
        setAvailableQuestions(formattedQuestions);
        setShowQuestionSelector(true);
      } else {
        alert('هذه المادة لا تحتوي على أسئلة');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleQuestionSelection = (questionId: number) => {
    if (selectedQuestionIds.includes(questionId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== questionId));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, questionId]);
    }
  };

  const applySelectedQuestions = () => {
    const selected = availableQuestions.filter(q => selectedQuestionIds.includes(q.id));
    if (selected.length === 0) {
      alert('الرجاء اختيار سؤال واحد على الأقل');
      return;
    }
    setQuestions(selected);
    setShowQuestionSelector(false);
    setSelectedQuestionIds([]);
    alert(`تم إضافة ${selected.length} سؤال للاختبار`);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    }]);
  };

  const addTempQuestion = () => {
    setTempQuestions([...tempQuestions, {
      id: Date.now(),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    }]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const removeTempQuestion = (id: number) => {
    setTempQuestions(tempQuestions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateTempQuestion = (id: number, field: string, value: any) => {
    setTempQuestions(tempQuestions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (qId: number, optIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === qId ? {
        ...q,
        options: q.options.map((opt, i) => i === optIndex ? value : opt)
      } : q
    ));
  };

  const updateTempOption = (qId: number, optIndex: number, value: string) => {
    setTempQuestions(tempQuestions.map(q => 
      q.id === qId ? {
        ...q,
        options: q.options.map((opt, i) => i === optIndex ? value : opt)
      } : q
    ));
  };

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateHTML = (questionsData: Question[], modelLabel: string | null, isAnswerKey: boolean) => {
    const arabicLetters = ['أ', 'ب', 'ج', 'د'];
    
    return `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 1.5cm; }
    body { font-family: 'Traditional Arabic', 'Arial', sans-serif; direction: rtl; margin: 0; padding: 20px; }
    .page-border { border: 3px solid #000; padding: 15px; min-height: 95vh; }
    .top-header { display: grid; grid-template-columns: 1fr auto 1fr; align-items: start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #000; }
    .header-right { text-align: right; }
    .header-right h3 { margin: 5px 0; font-size: 15px; font-weight: bold; }
    .header-center { text-align: center; padding: 0 20px; }
    .logo { width: 80px; height: 80px; margin: 0 auto 10px; }
    .header-center h2 { margin: 8px 0; font-size: 16px; font-weight: bold; }
    .header-left { text-align: left; }
    .header-left div { margin: 5px 0; font-size: 14px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .info-table td { border: 2px solid #000; padding: 8px; text-align: center; font-weight: bold; }
    .info-table .label { background: #e0e0e0; width: 20%; }
    .student-info { border: 2px solid #000; margin: 20px 0; }
    .student-info table { width: 100%; border-collapse: collapse; }
    .student-info td { padding: 8px; border: 1px solid #000; }
    .questions-container { column-count: 2; column-gap: 40px; column-rule: 1px solid #ddd; }
    .question { margin: 0 0 25px 0; page-break-inside: avoid; break-inside: avoid; }
    .question-header { font-weight: bold; font-size: 16px; margin-bottom: 12px; text-align: right; }
    .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin: 10px 0; direction: rtl; }
    .option { display: flex; align-items: center; gap: 8px; font-size: 15px; }
    .option-circle { width: 28px; height: 28px; border: 2px solid #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 14px; }
    .correct-answer .option-circle { background: #90EE90; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="page-border">
  ${modelLabel ? `<div style="background: #2c5f2d; color: #fff; padding: 8px; text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 15px;">${modelLabel}</div>` : ''}
  
  <div class="top-header">
    <div class="header-right">
      <h3>المملكة العربية السعودية</h3>
      <h3>وزارة التعليم</h3>
      <h3>${examInfo.educationDept}</h3>
      <h3>${examInfo.educationOffice}</h3>
      <h3>${examInfo.schoolName || 'مدرسة ..................'}</h3>
    </div>
    
    <div class="header-center">
      <svg class="logo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="95" fill="none" stroke="#2d5f2e" stroke-width="3"/>
        <circle cx="100" cy="100" r="85" fill="none" stroke="#2d5f2e" stroke-width="2"/>
        <g transform="translate(100, 100)">
          <path d="M -15 -40 L -15 25 L -18 30 L -15 32 L -12 30 L -15 25 Z" fill="#2d5f2e"/>
          <ellipse cx="-15" cy="27" rx="4" ry="6" fill="#2d5f2e"/>
          <path d="M 15 -40 L 15 25 L 18 30 L 15 32 L 12 30 L 15 25 Z" fill="#2d5f2e"/>
          <ellipse cx="15" cy="27" rx="4" ry="6" fill="#2d5f2e"/>
        </g>
        <g transform="translate(100, 80)">
          <rect x="-3" y="0" width="6" height="35" fill="#8b6914"/>
          <path d="M 0 -15 Q -20 -10 -25 5 Q -15 0 0 0" fill="#2d5f2e"/>
          <path d="M 0 -15 Q 20 -10 25 5 Q 15 0 0 0" fill="#2d5f2e"/>
          <path d="M 0 -20 Q -15 -18 -20 -5 Q -10 -8 0 -5" fill="#2d5f2e"/>
          <path d="M 0 -20 Q 15 -18 20 -5 Q 10 -8 0 -5" fill="#2d5f2e"/>
          <path d="M -2 -25 L -8 -30 L -5 -22 L 0 -25 L 5 -22 L 8 -30 L 2 -25 L 0 -32 Z" fill="#2d5f2e"/>
        </g>
        <text x="100" y="165" text-anchor="middle" font-size="18" font-weight="bold" fill="#2d5f2e">المملكة العربية السعودية</text>
        <text x="100" y="183" text-anchor="middle" font-size="14" font-weight="bold" fill="#2d5f2e">وزارة التعليم</text>
      </svg>
      <h2>${examInfo.title}</h2>
      <h2>للعام الدراسي ${examInfo.semester}</h2>
    </div>
    
    <div class="header-left">
      <div>المادة : ${examInfo.subject}</div>
      <div>الزمن : ${examInfo.duration}</div>
      <div>الصف : ${examInfo.grade}</div>
    </div>
  </div>

  <table class="info-table">
    <tr>
      <td class="label">الدرجة الأساسية</td>
      <td class="label">درجة الطالب رقماً</td>
      <td class="label">الدرجة كتابة</td>
      <td class="label">المصحح</td>
      <td class="label">المراجع</td>
    </tr>
    <tr>
      <td>${examInfo.totalMarks || ''}</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </table>

  <table class="student-info">
    <tr>
      <td style="width: 33%; text-align: right;">اسم الطالب /</td>
      <td style="width: 33%; text-align: center;">الشعبة /</td>
      <td style="width: 34%; text-align: left;">رقم الجلوس /</td>
    </tr>
  </table>

  <div class="questions-container">
    ${questionsData.map((q, idx) => `
      <div class="question">
        <div class="question-header">${idx + 1}. ${q.text}</div>
        <div class="options">
          ${[0, 1, 2, 3].map(i => `
            <div class="option ${isAnswerKey && i === q.correctAnswer ? 'correct-answer' : ''}">
              <div class="option-circle">${arabicLetters[i]}</div>
              <span>${q.options[i]}${isAnswerKey && i === q.correctAnswer ? ' ✓' : ''}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>

  <div class="footer"><p>بالتوفيق لجميع الطلاب والطالبات</p></div>
  </div>
</body>
</html>`;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleDownloadWord = () => {
    try {
      const html = generateHTML(questions, null, false);
      downloadFile('\ufeff' + html, 'اختبار.doc', 'application/msword;charset=utf-8');
      alert('تم تحميل ملف Word بنجاح ✅');
    } catch (error) {
      alert('حدث خطأ: ' + error);
    }
  };

  const handleDownloadHTML = () => {
    try {
      const html = generateHTML(questions, null, false);
      downloadFile(html, 'اختبار.html', 'text/html;charset=utf-8');
      alert('تم تحميل ملف HTML بنجاح ✅');
    } catch (error) {
      alert('حدث خطأ: ' + error);
    }
  };

  const handleDownloadModels = () => {
    try {
      for (let i = 0; i < numModels; i++) {
        setTimeout(() => {
          const shuffledQuestions = shuffleArray(questions.map(q => ({
            ...q,
            options: shuffleArray(q.options.map((opt, idx) => ({ text: opt, wasIndex: idx }))),
          }))).map(q => ({
            ...q,
            correctAnswer: q.options.findIndex((opt: any) => opt.wasIndex === q.correctAnswer)
          }));
          
          const modelLabel = `نموذج ${String.fromCharCode(65 + i)}`;
          const html = generateHTML(shuffledQuestions, modelLabel, false);
          downloadFile(html, `نموذج_${String.fromCharCode(65 + i)}.html`, 'text/html;charset=utf-8');
        }, i * 600);
      }
      
      setTimeout(() => {
        const html = generateHTML(questions, 'نموذج الإجابة', true);
        downloadFile(html, 'نموذج_الاجابة.html', 'text/html;charset=utf-8');
        alert(`تم تحميل ${numModels} نموذج + نموذج الإجابة ✅`);
      }, numModels * 600);
    } catch (error) {
      alert('حدث خطأ: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          
          {/* العنوان */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-900 mb-2">مولد الاختبارات الذكي</h1>
            <p className="text-gray-600">أنشئ اختبارات احترافية بنماذج متعددة</p>
          </div>

          {showSubjectsPage ? (
            // صفحة المواد
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-green-900">إدارة المواد وبنك الأسئلة</h2>
                <button
                  onClick={() => setShowSubjectsPage(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  رجوع للصفحة الرئيسية
                </button>
              </div>

              <div className="mb-6 p-6 bg-green-50 rounded-xl border-2 border-green-200">
                <h3 className="text-xl font-bold text-green-900 mb-4">إضافة مادة جديدة</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="اسم المادة (مثال: كيمياء 4 - ثالث ثانوي)"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="flex-1 p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                  />
                  <button
                    onClick={createNewSubject}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus size={20} />
                    إنشاء وإضافة أسئلة
                  </button>
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4">المواد الموجودة</h3>
                {subjects.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">لا توجد مواد محفوظة. أضف مادة جديدة للبدء</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.map((subject, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 transition">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-lg text-blue-900">{subject}</h4>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadSubjectQuestions(subject)}
                              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                            >
                              <Plus size={16} />
                              إضافة/تعديل
                            </button>
                            <button
                              onClick={() => deleteSubject(subject)}
                              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : showAddQuestionsPage ? (
            // صفحة إضافة الأسئلة
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-green-900">إضافة أسئلة</h2>
                  <p className="text-lg text-gray-700 mt-2">المادة: <span className="font-bold text-green-700">{selectedSubject}</span></p>
                </div>
                <button
                  onClick={() => {
                    setShowAddQuestionsPage(false);
                    setShowSubjectsPage(true);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  رجوع لإدارة المواد
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-green-900 mb-4">الأسئلة</h3>
                {tempQuestions.map((q, qIdx) => (
                  <div key={q.id} className="mb-6 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">السؤال {qIdx + 1}</h3>
                      <button onClick={() => removeTempQuestion(q.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    
                    <textarea placeholder="نص السؤال" value={q.text} onChange={(e) => updateTempQuestion(q.id, 'text', e.target.value)} className="w-full p-3 border-2 rounded-lg mb-4 focus:border-green-500 focus:outline-none" rows={2}/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="font-bold text-green-700 min-w-[30px]">{['أ', 'ب', 'ج', 'د'][optIdx]})</span>
                          <input type="text" placeholder={`الخيار ${['أ', 'ب', 'ج', 'د'][optIdx]}`} value={opt} onChange={(e) => updateTempOption(q.id, optIdx, e.target.value)} className="flex-1 p-2 border-2 rounded-lg focus:border-green-500 focus:outline-none"/>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <label className="font-semibold">الإجابة الصحيحة:</label>
                        <select value={q.correctAnswer} onChange={(e) => updateTempQuestion(q.id, 'correctAnswer', parseInt(e.target.value))} className="p-2 border-2 rounded-lg focus:border-green-500 focus:outline-none">
                          {[0, 1, 2, 3].map((idx) => (
                            <option key={idx} value={idx}>{['أ', 'ب', 'ج', 'د'][idx]}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="font-semibold">الدرجات:</label>
                        <input type="number" min="1" value={q.marks} onChange={(e) => updateTempQuestion(q.id, 'marks', parseInt(e.target.value))} className="w-20 p-2 border-2 rounded-lg focus:border-green-500 focus:outline-none"/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={addTempQuestion} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                  <Plus size={20} /> إضافة سؤال
                </button>
                <button onClick={saveQuestionBank} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  <Save size={20} /> حفظ بنك الأسئلة
                </button>
                <button onClick={() => setShowAddQuestionsPage(false)} className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {showQuestionSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">اختر الأسئلة</h2>
              <div className="space-y-3 mb-6">
                {availableQuestions.map((q) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <input type="checkbox" checked={selectedQuestionIds.includes(q.id)} onChange={() => toggleQuestionSelection(q.id)} className="mt-1"/>
                    <div className="flex-1">
                      <p className="font-semibold">{q.text}</p>
                      <p className="text-sm text-gray-600">الدرجات: {q.marks}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={applySelectedQuestions} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                  تطبيق
                </button>
                <button onClick={() => setShowQuestionSelector(false)} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
