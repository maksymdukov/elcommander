import React from 'react';
import { LocalFs } from '../../backends/local-fs';
import TreeViewInit from '../../views/tree-view/tree-view-init';
import classes from './main.scss';

const localFs = new LocalFs();

const Main = () => {
  return (
    <div className={classes.main}>
      <TreeViewInit localFs={localFs} />
      <TreeViewInit localFs={localFs} />
    </div>
  );
};

export default Main;
