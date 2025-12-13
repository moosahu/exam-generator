import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    
    const questions = await prisma.question.findMany({
      where: subjectId ? { subjectId } : undefined,
    });
    
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { subjectId, questions } = await request.json();
    
    await prisma.question.deleteMany({
      where: { subjectId },
    });
    
    const created = await prisma.question.createMany({
      data: questions.map((q: any) => ({
        text: q.text,
        option1: q.options[0],
        option2: q.options[1],
        option3: q.options[2],
        option4: q.options[3],
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        subjectId,
      })),
    });
    
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save questions' },
      { status: 500 }
    );
  }
}