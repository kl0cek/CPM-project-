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
  const { projectId } =  await params;

  const body = await request.json();

  const { id, name, duration, dependencies } = body;

  if (!name || !duration) {
    return NextResponse.json({ error: 'Name and duration required' }, { status: 400 });
  }

  const db = await getDB();

  const deps = JSON.stringify(dependencies || []);

  let result;
  if (id !== undefined && id !== null && id !== '') {
    result = await db.run(
      'INSERT INTO tasks (id, project_id, name, duration, dependencies) VALUES (?, ?, ?, ?, ?)',
      id,
      projectId,
      name,
      duration,
      deps
    );
  } else {
    result = await db.run(
      'INSERT INTO tasks (project_id, name, duration, dependencies) VALUES (?, ?, ?, ?)',
      projectId,
      name,
      duration,
      deps
    );
  }

  const insertedId = (id !== undefined && id !== null && id !== '') ? id : result.lastID;

  const task = await db.get('SELECT * FROM tasks WHERE id = ?', insertedId);

  task.dependencies = task.dependencies ? JSON.parse(task.dependencies) : [];

  return NextResponse.json({ task });
}

export async function PUT(request: Request, { params }: { params: { projectId: string, taskId: string } }) {
  const { projectId, taskId } = await params;
  const body = await request.json();
  const { id, name, duration, dependencies } = body;

  if (!name || !duration) {
    return NextResponse.json({ error: 'Name and duration required' }, { status: 400 });
  }

  const db = await getDB();
  const deps = JSON.stringify(dependencies || []);

  await db.run(
    'UPDATE tasks SET id = ?, name = ?, duration = ?, dependencies = ? WHERE id = ? AND project_id = ?',
    id, name, duration, deps, taskId, projectId
  );

  const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', id);
  if (updatedTask) {
    updatedTask.dependencies = updatedTask.dependencies ? JSON.parse(updatedTask.dependencies) : [];
    return NextResponse.json({ task: updatedTask });
  } else {
    return NextResponse.json({ error: 'Task not found or update failed' }, { status: 404 });
  }
}