import React from 'react';
import { createUseStyles } from 'react-jss';
import Main from './sections/main/main';
import Toolbar from './sections/toolbar/toolbar';
import DndPreviewIcon from './views/tree-view/components/dnd-preview-icon';
import './App.global.css';

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
    </>
  );
}
