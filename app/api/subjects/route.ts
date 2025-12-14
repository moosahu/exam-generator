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

// GET - جلب جميع المواد
export async function GET() {
  try {
    const subjects = await readData();
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST - إضافة مادة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'اسم المادة مطلوب' },
        { status: 400 }
      );
    }

    const subjects = await readData();
    
    // التحقق من عدم وجود المادة مسبقاً
    const exists = subjects.find((s: any) => s.name === name);
    if (exists) {
      return NextResponse.json(
        { error: 'المادة موجودة مسبقاً' },
        { status: 400 }
      );
    }

    const newSubject = {
      id: Date.now().toString(),
      name,
      questions: [],
      createdAt: new Date().toISOString()
    };

    subjects.push(newSubject);
    await writeData(subjects);

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة المادة' },
      { status: 500 }
    );
  }
}

// DELETE - حذف مادة
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'معرف المادة مطلوب' },
        { status: 400 }
      );
    }

    let subjects = await readData();
    const initialLength = subjects.length;
    subjects = subjects.filter((s: any) => s.id !== id);

    if (subjects.length === initialLength) {
      return NextResponse.json(
        { error: 'المادة غير موجودة' },
        { status: 404 }
      );
    }

    await writeData(subjects);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المادة' },
      { status: 500 }
    );
  }
}
