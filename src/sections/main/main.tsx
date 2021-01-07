import React from 'react';
import { LocalFs } from '../../backends/local-fs';
import TreeViewInit from '../../views/tree-view/tree-view-init';
import classes from './main.scss';
import TreeDndProvider from '../../views/tree-view/context/tree-dnd.provider';
import DndPreviewIcon from '../../components/tree/dnd-preview-icon';

const localFs = new LocalFs();

const Main = () => {
  return (
    <TreeDndProvider>
      <div className={classes.main}>
        <TreeViewInit localFs={localFs} />
        <TreeViewInit localFs={localFs} />
      </div>
      <DndPreviewIcon />
    </TreeDndProvider>
  );
};

export default Main;
