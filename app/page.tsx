'use client';
import { useEffect, useState } from 'react';
import { Button, TextField, List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  created_at: string;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');

  const fetchProjects = async () => {
    const res = await fetch('/api/project');
    const data = await res.json();
    setProjects(data.projects);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (newProjectName.trim() === '') return;
    await fetch('/api/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName })
    });
    setNewProjectName('');
    fetchProjects();
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    const res = await fetch(`/api/project/${projectId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      fetchProjects();
    } else {
      console.error('Failed to delete project');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>CPM Project Management</Typography>
      <TextField
        label="New Project Name"
        value={newProjectName}
        onChange={(e) => setNewProjectName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" onClick={handleCreateProject}>Create Project</Button>
      <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>Projects</Typography>
      <List>
        {projects.map(project => (
          <ListItem key={project.id}>
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              <Link href={`/project/${project.id}`}>
                <ListItemText primary={project.name} />
              </Link>
              <Button variant="outlined" color="error" onClick={() => handleDeleteProject(project.id)}>
                Delete
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>
    </div>
  );
}