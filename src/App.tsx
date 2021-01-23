import React from 'react';
import { createUseStyles } from 'react-jss';
import Main from './sections/main/main';
import Toolbar from './sections/toolbar/toolbar';
import './App.global.css';
import TreeDndProvider from './views/tree-view/context/tree-dnd.provider';
import DndPreviewIcon from './views/tree-view/components/dnd-preview-icon';

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
    <TreeDndProvider>
      <div className={classes.appContainer}>
        <Toolbar />
        <Main />
      </div>
      <DndPreviewIcon />
    </TreeDndProvider>
  );
}
