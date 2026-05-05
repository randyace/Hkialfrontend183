import React from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from './components/ThemeContext';
import { MemberProvider } from './contexts/MemberContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <MemberProvider>
        <RouterProvider router={router} />
      </MemberProvider>
    </ThemeProvider>
  );
}
