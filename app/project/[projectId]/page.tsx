'use client';

import { useState, useEffect } from 'react';
import { Typography, TextField, Button, List, ListItem, ListItemText, Box, Paper } from '@mui/material';
import Link from 'next/link';

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

interface ProjectPageProps {
  params: { projectId: string };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = params;

  const [project, setProject] = useState<{ id: string; name: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState('');
  const [dependencies, setDependencies] = useState('');
  const [cpmResult, setCpmResult] = useState<CPMResult | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
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

    await fetch(`/api/project/${projectId}/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: taskName, duration: parseInt(duration), dependencies: deps })
    });

    setTaskName('');
    setDuration('');
    setDependencies('');

    fetchTasks();
  };

  const handleCalculateCPM = async () => {
    const res = await fetch(`/api/project/${projectId}/calculate`);
    const data = await res.json();
    setCpmResult(data);
  };

  const handleExportPDF = () => {
    window.open(`/api/project/${projectId}/pdf-export`, '_blank');
  };

  const handleDeleteTask = async (taskId: number) => {
    await fetch(`/api/project/${projectId}/task/${taskId}`, {
      method: 'DELETE'
    });
    fetchTasks();
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingName(task.name);
    setEditingDuration(task.duration.toString());
    setEditingDependencies(task.dependencies.join(', '));
  };

  const handleSaveTask = async () => {
    if (editingTaskId === null) return;

    const deps = editingDependencies.split(',').map(s => s.trim()).filter(s => s !== '');

    await fetch(`/api/project/${projectId}/task/${editingTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName, duration: parseInt(editingDuration), dependencies: deps })
    });

    setEditingTaskId(null);
    setEditingName('');
    setEditingDuration('');
    setEditingDependencies('');
    fetchTasks();
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
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
          <Typography variant="h6" mt={2}>Tasks Details:</Typography>
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
          <Box mt={4}>
            <Typography variant="h6">Network Diagram (simple view)</Typography>
            <svg width="600" height="400" style={{ border: '1px solid #ccc' }}>
              {cpmResult.tasks.map((task, index) => (
                <g key={task.id} transform={`translate(${50 + index * 150}, 50)`}>
                  <rect width="100" height="50" fill={task.isCritical ? "#ffcccc" : "#ccffcc"} stroke="#000" />
                  <text x="50" y="25" alignmentBaseline="middle" textAnchor="middle" fontSize="12">{task.name}</text>
                </g>
              ))}
            </svg>
          </Box>
          <Box mt={4}>
            <Typography variant="h6">Gantt Chart (simple view)</Typography>
            <svg width="600" height="200" style={{ border: '1px solid #ccc' }}>
              {cpmResult.tasks.map((task, index) => {
                const scale = 10;
                const x = task.ES! * scale;
                const width = task.duration * scale;
                return (
                  <g key={task.id} transform={`translate(0, ${index * 30})`}>
                    <rect x={x} y={5} width={width} height={20} fill={task.isCritical ? "#ff9999" : "#99ff99"} stroke="#000" />
                    <text x={x + 5} y={20} fontSize="10">{task.name}</text>
                  </g>
                );
              })}
            </svg>
          </Box>
        </Box>
      )}
    </div>
  );
}