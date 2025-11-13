import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await prisma.habitLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching habit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch habit logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { habitId, date, completed, note } = body;

    const log = await prisma.habitLog.create({
      data: {
        habitId,
        date: new Date(date),
        completed: completed !== undefined ? completed : true,
        note: note || null,
        userId: session.user.id,
        syncStatus: 'synced',
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error creating habit log:', error);
    return NextResponse.json({ error: 'Failed to create habit log' }, { status: 500 });
  }
}
