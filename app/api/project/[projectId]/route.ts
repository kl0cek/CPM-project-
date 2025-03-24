import {getDB} from "@/lib/database";
import {NextResponse} from "next/server";

export async function DELETE(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = await params;

  const db = await getDB();

  const project = await db.get('SELECT * FROM projects WHERE id = ?', projectId);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  await db.run('DELETE FROM tasks WHERE project_id = ?', projectId);

  await db.run('DELETE FROM projects WHERE id = ?', projectId);

  return NextResponse.json({ message: `Project ${projectId} deleted successfully` });
}