'use client';
import { CssBaseline, Container } from '@mui/material';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html>
      <head>
        <title>CPM Method</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </head>

      <body>
        <CssBaseline/>

        <Container maxWidth="md" sx={{pt: 5, pb: 10}}>
          {children}
        </Container>
      </body>
    </html>
  )
}