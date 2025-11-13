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

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, frequency, goal, color, icon } = body;

    const habit = await prisma.habit.create({
      data: {
        name,
        description: description || null,
        frequency: frequency || 'daily',
        goal: goal || 1,
        color: color || 'blue',
        icon: icon || null,
        userId: session.user.id,
        syncStatus: 'synced',
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}
