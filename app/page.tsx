'use client';

import React, { useState } from 'react';
import { FileText, Download, Plus, Trash2, Shuffle, Save, BookOpen } from 'lucide-react';

export default function ExamGenerator() {
  const [examInfo, setExamInfo] = useState({
    title: 'اختبار نهاية الفصل الدراسي الثاني',
    subject: '',
    duration: '',
    totalMarks: '',
    semester: '',
    schoolName: '',
    educationDept: 'الإدارة العامة للتعليم بالمنطقة الشرقية',
    educationOffice: 'مكتب التعليم بالخبر',
    grade: ''
  });

  const [questions, setQuestions] = useState([
    { id: 1, text: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }
  ]);

  const [numModels, setNumModels] = useState(2);

  const addQuestion = () => {
    setQuestions([...questions, {
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

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId: number, optIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === qId ? {
        ...q,
        options: q.options.map((opt, i) => i === optIndex ? value : opt)
      } : q
    ));
  };

  const generateHTML = (questionsData: any[], modelLabel: string | null, isAnswerKey: boolean) => {
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
    .header-right, .header-left { text-align: right; }
    .header-right h3, .header-left div { margin: 5px 0; font-size: 14px; font-weight: bold; }
    .header-center { text-align: center; padding: 0 20px; }
    .logo { width: 80px; height: 80px; margin: 0 auto 10px; }
    .header-center h2 { margin: 8px 0; font-size: 16px; font-weight: bold; }
    .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .info-table td { border: 2px solid #000; padding: 8px; text-align: center; font-weight: bold; }
    .info-table .label { background: #e0e0e0; }
    .student-info { border: 2px solid #000; margin: 20px 0; }
    .student-info table { width: 100%; border-collapse: collapse; }
    .student-info td { padding: 8px; border: 1px solid #000; }
    .questions-container { column-count: 2; column-gap: 40px; column-rule: 1px solid #ddd; }
    .question { margin: 0 0 25px 0; page-break-inside: avoid; break-inside: avoid; }
    .question-header { font-weight: bold; font-size: 16px; margin-bottom: 12px; }
    .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin: 10px 0; direction: rtl; }
    .option { display: flex; align-items: center; gap: 8px; font-size: 15px; }
    .option-circle { width: 28px; height: 28px; border: 2px solid #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
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
        <text x="100" y="110" text-anchor="middle" font-size="50" fill="#2d5f2e">🇸🇦</text>
      </svg>
      <h2>${examInfo.title}</h2>
      <h2>للعام الدراسي ${examInfo.semester}</h2>
    </div>
    
    <div class="header-left">
      <div>المادة: ${examInfo.subject}</div>
      <div>الزمن: ${examInfo.duration}</div>
      <div>الصف: ${examInfo.grade}</div>
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

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHTML = () => {
    const html = generateHTML(questions, null, false);
    downloadFile(html, 'اختبار.html');
    alert('تم التحميل ✅');
  };

  const handleDownloadModels = () => {
    for (let i = 0; i < numModels; i++) {
      setTimeout(() => {
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        const html = generateHTML(shuffled, `نموذج ${String.fromCharCode(65 + i)}`, false);
        downloadFile(html, `نموذج_${String.fromCharCode(65 + i)}.html`);
      }, i * 500);
    }
    setTimeout(() => {
      const html = generateHTML(questions, 'نموذج الإجابة', true);
      downloadFile(html, 'نموذج_الاجابة.html');
      alert('تم تحميل جميع النماذج ✅');
    }, numModels * 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-900 mb-2">مولد الاختبارات الذكي</h1>
            <p className="text-gray-600">أنشئ اختبارات احترافية بنماذج متعددة</p>
          </div>

          <div className="mb-8 p-6 bg-green-50 rounded-xl">
            <h2 className="text-2xl font-bold text-green-900 mb-4">معلومات الاختبار</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="اسم المدرسة" value={examInfo.schoolName} onChange={(e) => setExamInfo({...examInfo, schoolName: e.target.value})} className="p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"/>
              <input type="text" placeholder="الإدارة" value={examInfo.educationDept} onChange={(e) => setExamInfo({...examInfo, educationDept: e.target.value})} className="p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"/>
              <input type="text" placeholder="المادة" value={examInfo.subject} onChange={(e) => setExamInfo({...examInfo, subject: e.target.value})} className="p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"/>
              <input type="text" placeholder="الزمن" value={examInfo.duration} onChange={(e) => setExamInfo({...examInfo, duration: e.target.value})} className="p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"/>
              <input type="text" placeholder="الصف" value={examInfo.grade} onChange={(e) => setExamInfo({...examInfo, grade: e.target.value})} className="p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"/>
              <input type="text" placeholder="الدرجة الكلية" value={examInfo.totalMarks} onChange={(e) => setExamInfo({...examInfo, totalMarks: e.target.value})} className="p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"/>
              <input type="text" placeholder="العام الدراسي" value={examInfo.semester} onChange={(e) => setExamInfo({...examInfo, semester: e.target.value})} className="p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"/>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-green-900 mb-4">الأسئلة</h2>
            {questions.map((q, qIdx) => (
              <div key={q.id} className="mb-6 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">السؤال {qIdx + 1}</h3>
                  <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <textarea placeholder="نص السؤال" value={q.text} onChange={(e) => updateQuestion(q.id, 'text', e.target.value)} className="w-full p-3 border-2 rounded-lg mb-4 focus:border-green-500 focus:outline-none" rows={2}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <span className="font-bold text-green-700 min-w-[30px]">{['أ', 'ب', 'ج', 'د'][optIdx]})</span>
                      <input type="text" placeholder={`الخيار ${['أ', 'ب', 'ج', 'د'][optIdx]}`} value={opt} onChange={(e) => updateOption(q.id, optIdx, e.target.value)} className="flex-1 p-2 border-2 rounded-lg focus:border-green-500 focus:outline-none"/>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <label className="font-semibold">الإجابة الصحيحة:</label>
                    <select value={q.correctAnswer} onChange={(e) => updateQuestion(q.id, 'correctAnswer', parseInt(e.target.value))} className="p-2 border-2 rounded-lg">
                      {['أ', 'ب', 'ج', 'د'].map((letter, idx) => (
                        <option key={idx} value={idx}>{letter}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold">الدرجة:</label>
                    <input type="number" value={q.marks} onChange={(e) => updateQuestion(q.id, 'marks', parseInt(e.target.value))} className="w-20 p-2 border-2 rounded-lg" min="1"/>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addQuestion} className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 font-semibold">
              <Plus size={20} />
              إضافة سؤال جديد
            </button>
          </div>

          <div className="p-6 bg-blue-50 rounded-xl">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">تصدير الاختبار</h2>
            
            <div className="mb-4">
              <label className="font-semibold mb-2 block">عدد النماذج:</label>
              <input type="number" value={numModels} onChange={(e) => setNumModels(Math.max(1, parseInt(e.target.value) || 1))} className="w-32 p-2 border-2 rounded-lg" min="1" max="10"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={handleDownloadHTML} className="py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center gap-2 font-semibold">
                <FileText size={20} />
                <span>تحميل HTML</span>
              </button>
              
              <button onClick={handleDownloadModels} className="py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 font-semibold">
                <Shuffle size={20} />
                <span>توليد النماذج</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}