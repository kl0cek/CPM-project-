export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/database';

// @ts-ignore
import PDFDocument from 'pdfkit/js/pdfkit.standalone';
import getStream from 'get-stream';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

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

export async function GET(
  request: Request, 
  context: { params: { projectId: string } }
) {
  try {
    // Get the projectId from params - using context.params structure
    const projectId = context.params.projectId;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const db = await getDB();

    const project = await db.get('SELECT * FROM projects WHERE id = ?', projectId);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const tasks: Task[] = await db.all('SELECT * FROM tasks WHERE project_id = ?', projectId);

    tasks.forEach(task => {
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
    const results = Object.values(tasksMap);

    // Create PDFDocument without using pdfkit-table
    const doc = new PDFDocument({ margin: 40, size: 'A4'});
    
    let buffers: Uint8Array[] = [];
    doc.on('data', buffers.push.bind(buffers));

    doc.fontSize(20).text(`Project: ${project.name}`, { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`Project Duration: ${projectDuration}`);
    doc.moveDown();
    doc.fontSize(16).text("Tasks:");
    results.forEach(task => {
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Task: ${task.name}`);
      doc.text(`Duration: ${task.duration}`);
      doc.text(`ES: ${task.ES}, EF: ${task.EF}, LS: ${task.LS}, LF: ${task.LF}, Slack: ${task.slack}`);
      doc.text(`Critical: ${task.isCritical ? 'Yes' : 'No'}`);
    });

    // Since pdfkit-table isn't working as expected, let's manually create a table
    doc.addPage();
    doc.fontSize(16).text("Tasks Table:", { underline: true });
    doc.moveDown();
    
    // Define column widths and starting positions
    const columnWidths = [30, 120, 30, 30, 30, 30, 30, 40, 60];
    const startY = doc.y + 20;
    let currentY = startY;
    
    // Draw header
    const headers = ['ID', 'Name', 'Dur.', 'ES', 'EF', 'LS', 'LF', 'Slack', 'Critical'];
    let currentX = 50;
    
    // Draw header background
    doc.rect(40, currentY - 5, 400, 20).fill('#e0e0e0');
    
    // Draw header text
    doc.font('Helvetica-Bold').fontSize(10);
    headers.forEach((header, i) => {
      doc.text(header, currentX, currentY, { width: columnWidths[i], align: 'center' });
      currentX += columnWidths[i];
    });
    
    // Draw rows
    currentY += 20;
    results.forEach((task, rowIndex) => {
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.rect(40, currentY - 5, 400, 20).fill('#f8f8f8');
      }
      
      const rowData = [
        task.id, 
        task.name, 
        task.duration, 
        task.ES, 
        task.EF, 
        task.LS, 
        task.LF, 
        task.slack, 
        task.isCritical ? 'Yes' : 'No'
      ];
      
      currentX = 50;
      doc.font('Helvetica').fontSize(9).fillColor('#000');
      
      rowData.forEach((cell, i) => {
        doc.text(String(cell), currentX, currentY, { 
          width: columnWidths[i], 
          align: i === 1 ? 'left' : 'center' // Align Name column to left, others to center
        });
        currentX += columnWidths[i];
      });
      
      currentY += 20;
      
      // Add a new page if we're about to go off the page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });
/*
    // 2) WYKRES:
    doc.addPage();
    doc.fontSize(16).text("Tasks Distribution:", { underline: true });
    doc.moveDown();
    
    const chart = new ChartJSNodeCanvas({ width: 500, height: 300 });
    const critical = results.filter(t => t.isCritical).length;
    const non = results.length - critical;
    
    try {
      const img = await chart.renderToBuffer({
        type: 'bar',
        data: {
          labels: ['Critical Tasks', 'Non-critical Tasks'],
          datasets: [{
            data: [critical, non], 
            backgroundColor: ['#FF6384', '#36A2EB']
          }]
        },
        options: { 
          plugins: { 
            legend: { display: false }, 
            title: { display: true, text: 'Tasks Distribution' } 
          } 
        }
      });
      doc.image(img, { align: 'center', fit: [500, 300] });
    } catch (chartError) {
      console.error('Chart generation error:', chartError);
      doc.text('Chart generation failed. Please see console for details.', { align: 'center' });
    }*/

    doc.end();

    const pdfBuffer = await getStream.buffer(doc);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="project_${projectId}_cpm.pdf"`
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF', details: String(error) }, { status: 500 });
  }
}