import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { table as pdfTable } from 'pdfkit-table';

export interface Task {
    id: number;
    name: string;
    duration: number;
    ES: number; EF: number;
    LS: number; LF: number;
    slack: number;
    isCritical: boolean;
}

export async function addTaskTable(
    doc: PDFKit.PDFDocument,
    tasks: Task[]
): Promise<void> {
    const tableData = {
        headers: ['ID','Nazwa','Dur.','ES','EF','LS','LF','Slack','Krytyczne'],
        rows: tasks.map(t => [
          t.id, t.name, t.duration, t.ES, t.EF, t.LS, t.LF, t.slack, t.isCritical ? 'Tak' : 'Nie',
        ]),
      };
    
      await doc.table(tableData, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
        prepareRow: (_row, i) =>
          doc.font('Helvetica').fontSize(9).fillColor(i % 2 ? '#444444' : '#000000'),
        columnSpacing: 5,
        padding: 3,
      });
    }

    export async function getTasksChartBuffer(
        tasks: Task[]
      ): Promise<Buffer> {
        const chart = new ChartJSNodeCanvas({ width: 500, height: 300 });
        const critical = tasks.filter(t => t.isCritical).length;
        const nonCritical = tasks.length - critical;
      
        const config = {
          type: 'bar' as const,
          data: {
            labels: ['Krytyczne','Nie-krytyczne'],
            datasets: [{ data: [critical, nonCritical], label: 'Liczba zadań' }],
          },
          options: {
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Zestawienie zadań' },
            },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          },
        };
      
        return chart.renderToBuffer(config);
      }
    