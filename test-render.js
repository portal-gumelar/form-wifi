import React from 'react';
import { renderToString } from 'react-dom/server';
import Dashboard from './src/pages/Dashboard.tsx';
console.log('Rendering...');
try {
  const html = renderToString(<Dashboard googleScriptUrl="" onLogout={()=>{}} userRole="admin" />);
  console.log('Render Success!');
} catch (e) {
  console.error('RENDER ERROR:', e);
}
