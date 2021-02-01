import React from 'react';
import { createUseStyles } from 'react-jss';
import Main from './sections/main/main';
import Toolbar from './sections/toolbar/toolbar';
import './App.global.css';
import DndPreviewIcon from './views/tree-view/components/dnd-preview-icon';
import Preferences from './views/preferences/preferences';

const useStyles = createUseStyles({
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
});

export default function App() {
  const classes = useStyles();
  return (
    <>
      <div className={classes.appContainer}>
        <Toolbar />
        <Main />
      </div>
      <DndPreviewIcon />
      <Preferences />
    </>
  );
}
