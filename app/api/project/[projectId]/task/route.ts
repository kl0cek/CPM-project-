import { NextResponse } from 'next/server';
import { getDB } from '@/lib/database';

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = await params;

  const db = await getDB();

  const tasks = await db.all('SELECT * FROM tasks WHERE project_id = ?', projectId);

  tasks.forEach((task: any) => {
    task.dependencies = task.dependencies ? JSON.parse(task.dependencies) : [];
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = await params;

  const body = await request.json();

  const { name, duration, dependencies } = body;

  if (!name || !duration) {
    return NextResponse.json({ error: 'Name and duration required' }, { status: 400 });
  }

  const db = await getDB();

  const deps = JSON.stringify(dependencies || []);

  const result = await db.run(
    'INSERT INTO tasks (project_id, name, duration, dependencies) VALUES (?, ?, ?, ?)',
    projectId,
    name,
    duration,
    deps
  );

  const task = await db.get('SELECT * FROM tasks WHERE id = ?', result.lastID);

  task.dependencies = task.dependencies ? JSON.parse(task.dependencies) : [];

  return NextResponse.json({ task });
}