import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'subjects.json');

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
    console.error('Error:', error);
  }
}

async function readData(): Promise<any[]> {
  await ensureDataFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

async function writeData(data: any[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId, questions } = body;
    if (!subjectId || !questions) {
      return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 });
    }
    const subjects = await readData();
    const subjectIndex = subjects.findIndex((s: any) => s.id === subjectId);
    if (subjectIndex === -1) {
      return NextResponse.json({ error: 'المادة غير موجودة' }, { status: 404 });
    }
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
    subjects[subjectIndex].questions = formattedQuestions;
    await writeData(subjects);
    return NextResponse.json({ success: true, count: formattedQuestions.length });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
