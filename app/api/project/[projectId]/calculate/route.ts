import { NextResponse } from 'next/server';
import { getDB } from '@/lib/database';

interface Task {
  id: number;
  project_id: number;
  name: string;
  duration: number;
  dependencies: number[];
  ES?: number;
  EF?: number;
  LS?: number;
  LF?: number;
  slack?: number;
  isCritical?: boolean;
}

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = await params;

  const db = await getDB();

  const tasks: Task[] = await db.all('SELECT * FROM tasks WHERE project_id = ?', projectId);

  tasks.forEach(task => {
    // @ts-ignore
    task.dependencies = task.dependencies ? JSON.parse(task.dependencies) : [];
  });

  const tasksMap: { [key: number]: Task } = {};

  tasks.forEach(task => {
    tasksMap[task.id] = { ...task, ES: 0, EF: task.duration, LS: Infinity, LF: Infinity, slack: 0 };
  });

  const inDegree: { [key: number]: number } = {};

  const childrenMap: { [key: number]: number[] } = {};

  tasks.forEach(task => {
    inDegree[task.id] = task.dependencies.length;
    childrenMap[task.id] = [];
  });

  tasks.forEach(task => {
    task.dependencies.forEach(depId => {
      if (childrenMap[depId]) {
        childrenMap[depId].push(task.id);
      }
    });
  });

  let queue: number[] = [];

  tasks.forEach(task => {
    if (inDegree[task.id] === 0) queue.push(task.id);
  });

  let topoOrder: number[] = [];

  while (queue.length > 0) {
    const tid = queue.shift()!;

    topoOrder.push(tid);

    const task = tasksMap[tid];

    childrenMap[tid].forEach(childId => {
      const child = tasksMap[childId];

      child.ES = Math.max(child.ES!, task.EF!);
      child.EF = child.ES! + child.duration;

      inDegree[childId]--;

      if (inDegree[childId] === 0) queue.push(childId);
    });
  }

  if (topoOrder.length !== tasks.length) {
    return NextResponse.json({ error: "Cycle detected in tasks dependencies" }, { status: 400 });
  }

  let projectDuration = 0;

  tasks.forEach(task => {
    projectDuration = Math.max(projectDuration, tasksMap[task.id].EF!);
  });

  const outDegree: { [key: number]: number } = {};

  tasks.forEach(task => {
    outDegree[task.id] = childrenMap[task.id].length;
  });

  tasks.forEach(task => {
    if (outDegree[task.id] === 0) {
      tasksMap[task.id].LF = projectDuration;
      tasksMap[task.id].LS = projectDuration - task.duration;
    }
  });

  topoOrder.reverse().forEach(tid => {
    const task = tasksMap[tid];

    if (childrenMap[tid].length > 0) {
      let minLS = Infinity;

      childrenMap[tid].forEach(childId => {
        const child = tasksMap[childId];
        minLS = Math.min(minLS, child.LS!);
      });

      task.LF = minLS;
      task.LS = task.LF - task.duration;
    }

    task.slack = task.LS! - task.ES!;
    task.isCritical = task.slack === 0;
  });

  return NextResponse.json({ projectDuration, tasks: Object.values(tasksMap) });
}