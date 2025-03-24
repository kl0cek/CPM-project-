import { NextResponse } from 'next/server';
import { getDB } from '@/lib/database';

export async function GET() {
  const db = await getDB();

  const projects = await db.all('SELECT * FROM projects');

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = await request.json();

  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  const db = await getDB();

  const result = await db.run('INSERT INTO projects (name) VALUES (?)', name);

  const project = await db.get('SELECT * FROM projects WHERE id = ?', result.lastID);

  return NextResponse.json({ project });
}