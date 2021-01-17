import React from 'react';
import Main from './sections/main/main';
import Toolbar from './sections/toolbar/toolbar';

export default function App() {
  return (
    <div className="app-container">
      <Toolbar />
      <Main />
    </div>
  );
}
