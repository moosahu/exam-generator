import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'subjects.json');

// التأكد من وجود ملف البيانات
async function ensureDataFile() {
  try {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify([]), 'utf-8');
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
  }
}

// قراءة البيانات
async function readData(): Promise<any[]> {
  await ensureDataFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading data:', error);
    return [];
  }
}

// كتابة البيانات
async function writeData(data: any[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// POST - إضافة أسئلة لمادة معينة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId, questions } = body;

    if (!subjectId) {
      return NextResponse.json(
        { error: 'معرف المادة مطلوب' },
        { status: 400 }
      );
    }

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'الأسئلة مطلوبة' },
        { status: 400 }
      );
    }

    const subjects = await readData();
    const subjectIndex = subjects.findIndex((s: any) => s.id === subjectId);

    if (subjectIndex === -1) {
      return NextResponse.json(
        { error: 'المادة غير موجودة' },
        { status: 404 }
      );
    }

    // تحويل الأسئلة للتنسيق المطلوب
    const formattedQuestions = questions
      .filter((q: any) => q.text && q.text.trim() !== '')
      .map((q: any) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: q.text,
        option1: q.options?.[0] || '',
        option2: q.options?.[1] || '',
        option3: q.options?.[2] || '',
        option4: q.options?.[3] || '',
        correctAnswer: q.correctAnswer || 0,
        marks: q.marks || 1
      }));

    // استبدال الأسئلة القديمة بالجديدة
    subjects[subjectIndex].questions = formattedQuestions;
    subjects[subjectIndex].updatedAt = new Date().toISOString();

    await writeData(subjects);

    return NextResponse.json({ 
      success: true, 
      questionsCount: formattedQuestions.length 
    });
  } catch (error) {
    console.error('POST Questions Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ الأسئلة' },
      { status: 500 }
    );
  }
}

// GET - جلب أسئلة مادة معينة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json(
        { error: 'معرف المادة مطلوب' },
        { status: 400 }
      );
    }

    const subjects = await readData();
    const subject = subjects.find((s: any) => s.id === subjectId);

    if (!subject) {
      return NextResponse.json(
        { error: 'المادة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(subject.questions || []);
  } catch (error) {
    console.error('GET Questions Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
