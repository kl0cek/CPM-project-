'use client';
import { useEffect, useState } from 'react';
import { Button, TextField, List, ListItem, ListItemText, Typography } from '@mui/material';
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
            <Link href={`/project/${project.id}`}>
              <ListItemText primary={project.name} />
            </Link>
          </ListItem>
        ))}
      </List>
    </div>
  );
}