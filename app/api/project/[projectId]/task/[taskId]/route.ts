import { NextResponse } from 'next/server';
import { getDB } from '@/lib/database';

export async function PUT(request: Request, { params }: { params: { projectId: string, taskId: string }}) {
  const { projectId, taskId } = await params;

  const body = await request.json();

  const { name, duration, dependencies } = body;

  if (!name || !duration) {
    return NextResponse.json({ error: 'Name and duration are required' }, { status: 400 });
  }

  const db = await getDB();
  const deps = JSON.stringify(dependencies || []);

  await db.run(
    'UPDATE tasks SET name = ?, duration = ?, dependencies = ? WHERE id = ? AND project_id = ?',
    name,
    duration,
    deps,
    taskId,
    projectId
  );

  const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ? AND project_id = ?', taskId, projectId);

  if (updatedTask) {
    updatedTask.dependencies = updatedTask.dependencies ? JSON.parse(updatedTask.dependencies) : [];
    return NextResponse.json({ task: updatedTask });
  } else {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: { projectId: string, taskId: string }}) {
  const { projectId, taskId } = await params;

  const db = await getDB();

  const task = await db.get('SELECT * FROM tasks WHERE id = ? AND project_id = ?', taskId, projectId);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  await db.run('DELETE FROM tasks WHERE id = ? AND project_id = ?', taskId, projectId);

  return NextResponse.json({ message: 'Task deleted successfully' });
}