'use client';

import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, List, ListItem, ListItemText, Box, Paper } from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Importy dla React Flow
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'react-flow-renderer';
// Import dla Google Charts
import { Chart } from 'react-google-charts';

interface Task {
  id: number;
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

interface CPMResult {
  projectDuration: number;
  tasks: Task[];
}

// ============================================================================
// Komponent FlowNetworkDiagram – wizualizacja sieci przy użyciu React Flow
// ============================================================================

function FlowNetworkDiagram({ tasks }: { tasks: Task[] }) {
  // Przygotowujemy węzły (nodes)
  const nodes: Node[] = tasks.map((task, index) => ({
    id: task.id.toString(),
    data: { label: `${task.name} (ID: ${task.id})` },
    position: { x: (task.ES || 0) * 150, y: index * 100 },
    style: {
      background: task.isCritical ? '#ffcccc' : '#ccffcc',
      border: '1px solid #222',
      padding: 10,
      borderRadius: 5,
      width: 120,
      textAlign: 'center',
    },
  }));

  // Przygotowujemy połączenia (edges)
  const edges: Edge[] = [];
  tasks.forEach(task => {
    task.dependencies.forEach(dep => {
      edges.push({
        id: `e${dep}-${task.id}`,
        source: dep.toString(),
        target: task.id.toString(),
        animated: !!task.isCritical,
        style: { stroke: '#000' },
        markerEnd: { type: 'arrowclosed' },
      });
    });
  });

  return (
    <div style={{ width: '100%', height: 600 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <MiniMap />
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}

// ============================================================================
// Komponent EnhancedGanttChart – wizualizacja wykresu Gantta przy użyciu Google Charts
// ============================================================================

function EnhancedGanttChart({ tasks, projectDuration }: { tasks: Task[]; projectDuration: number }) {
  const baseline = new Date();
  const data = [
    [
      { type: 'string', label: 'Task ID' },
      { type: 'string', label: 'Task Name' },
      { type: 'string', label: 'Resource' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' },
    ],
  ];

  tasks.forEach(task => {
    const startDate = new Date(baseline.getTime() + ((task.ES || 0) * 24 * 60 * 60 * 1000));
    const endDate = new Date(baseline.getTime() + (task.EF! * 24 * 60 * 60 * 1000));
    data.push([
      task.id.toString(),
      task.name,
      '',
      startDate,
      endDate,
      null,
      100,
      task.dependencies.join(','),
    ]);
  });

  const options = {
    height: 400,
    gantt: {
      trackHeight: 30,
      criticalPathEnabled: true,
      arrow: {
        angle: 100,
        width: 5,
        color: 'red',
        radius: 0,
      },
    },
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <Chart chartType="Gantt" width="100%" height="400px" data={data} options={options} />
    </div>
  );
}

// ============================================================================
// Główny komponent ProjectPage
// ============================================================================

export default function ProjectPage() {
  const { projectId } = useParams() as { projectId: string };

  const [project, setProject] = useState<{ id: string; name: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskId, setTaskId] = useState(''); // Stan dla ręcznego ustawienia ID przy dodawaniu
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState('');
  const [dependencies, setDependencies] = useState('');
  const [cpmResult, setCpmResult] = useState<CPMResult | null>(null);

  // Stany dla edycji zadania
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingNewId, setEditingNewId] = useState(''); // Stan dla nowego ID przy edycji
  const [editingName, setEditingName] = useState('');
  const [editingDuration, setEditingDuration] = useState('');
  const [editingDependencies, setEditingDependencies] = useState('');

  const fetchTasks = async () => {
    const res = await fetch(`/api/project/${projectId}/task`);
    const data = await res.json();
    setTasks(data.tasks);
  };

  const fetchProject = async () => {
    setProject({ id: projectId, name: `Project ${projectId}` });
  };

  useEffect(() => {
    fetchTasks();
    fetchProject();
  }, [projectId]);

  const handleAddTask = async () => {
    const deps = dependencies.split(',').map(s => s.trim()).filter(s => s !== '');
    const payload: any = {
      name: taskName,
      duration: parseInt(duration),
      dependencies: deps,
    };
    if (taskId.trim() !== '') {
      payload.id = parseInt(taskId);
    }
    await fetch(`/api/project/${projectId}/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setTaskId('');
    setTaskName('');
    setDuration('');
    setDependencies('');
    fetchTasks();
  };

  const handleCalculateCPM = async () => {
    const res = await fetch(`/api/project/${projectId}/calculate`);
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Error calculating CPM');
      return;
    }
    setCpmResult(data);
  };

  const handleExportPDF = () => {
    window.open(`/api/project/${projectId}/pdf-export`, '_blank');
  };

  const handleDeleteTask = async (taskId: number) => {
    await fetch(`/api/project/${projectId}/task/${taskId}`, {
      method: 'DELETE',
    });
    fetchTasks();
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingNewId(task.id.toString());
    setEditingName(task.name);
    setEditingDuration(task.duration.toString());
    setEditingDependencies(task.dependencies.join(', '));
  };

  const handleSaveTask = async () => {
    if (editingTaskId === null) return;
    const deps = editingDependencies.split(',').map(s => s.trim()).filter(s => s !== '');
    const payload: any = {
      name: editingName,
      duration: parseInt(editingDuration),
      dependencies: deps,
      id: parseInt(editingNewId),
    };
    await fetch(`/api/project/${projectId}/task/${editingTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setEditingTaskId(null);
    setEditingNewId('');
    setEditingName('');
    setEditingDuration('');
    setEditingDependencies('');
    fetchTasks();
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingNewId('');
    setEditingName('');
    setEditingDuration('');
    setEditingDependencies('');
  };

  return (
    <div>
      <Link href="/"><Button variant="outlined" style={{ marginTop: '10px' }}>Back to Projects</Button></Link>
      <Typography variant="h4" gutterBottom>{project ? project.name : "Project"}</Typography>

      <Paper style={{ padding: '16px', marginBottom: '20px' }}>
        <Typography variant="h6">Add Task</Typography>
        <TextField
          label="Task ID (optional)"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Dependencies (comma separated Task IDs)"
          value={dependencies}
          onChange={(e) => setDependencies(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" onClick={handleAddTask}>Add Task</Button>
      </Paper>

      <Typography variant="h5" gutterBottom>Tasks</Typography>
      <List>
        {tasks.map(task => (
          <ListItem key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingTaskId === task.id ? (
              <Box display="flex" flexDirection="column" width="100%">
                <TextField
                  label="Task ID (optional)"
                  value={editingNewId}
                  onChange={(e) => setEditingNewId(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Task Name"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Duration"
                  type="number"
                  value={editingDuration}
                  onChange={(e) => setEditingDuration(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Dependencies (comma separated Task IDs)"
                  value={editingDependencies}
                  onChange={(e) => setEditingDependencies(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Box mt={1}>
                  <Button variant="contained" onClick={handleSaveTask}>Save</Button>
                  <Button variant="outlined" onClick={handleCancelEdit} style={{ marginLeft: '10px' }}>Cancel</Button>
                </Box>
              </Box>
            ) : (
              <>
                <ListItemText
                  primary={`[ID: ${task.id}] ${task.name} (Duration: ${task.duration}, Dependencies: ${(task.dependencies || []).join(', ')})`}
                />
                <Box>
                  <Button variant="outlined" onClick={() => handleEditTask(task)}>Edit</Button>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteTask(task.id)} style={{ marginLeft: '10px' }}>Delete</Button>
                </Box>
              </>
            )}
          </ListItem>
        ))}
      </List>
      <Box mt={2}>
        <Button variant="contained" onClick={handleCalculateCPM}>Calculate CPM</Button>
        <Button variant="outlined" onClick={handleExportPDF} style={{ marginLeft: '10px' }}>Export PDF</Button>
      </Box>
      {cpmResult && (
        <Box mt={4}>
          <Typography variant="h5">CPM Analysis</Typography>
          <Typography>Project Duration: {cpmResult.projectDuration}</Typography>
          <Box mt={2}>
            <Typography variant="h6">Network Diagram</Typography>
            <FlowNetworkDiagram tasks={cpmResult.tasks} />
          </Box>
          <Box mt={2}>
            <Typography variant="h6">Gantt Chart</Typography>
            <EnhancedGanttChart tasks={cpmResult.tasks} projectDuration={cpmResult.projectDuration} />
          </Box>
          <Box mt={2}>
            <Typography variant="body1">Tasks Details:</Typography>
            {cpmResult.tasks.map(task => (
              <Paper key={task.id} style={{ padding: '10px', marginBottom: '10px' }}>
                <Typography>Task: {task.name} (ID: {task.id})</Typography>
                <Typography>Duration: {task.duration}</Typography>
                <Typography>ES: {task.ES}, EF: {task.EF}</Typography>
                <Typography>LS: {task.LS}, LF: {task.LF}</Typography>
                <Typography>Slack: {task.slack}</Typography>
                <Typography>Critical: {task.isCritical ? 'Yes' : 'No'}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </div>
  );
}