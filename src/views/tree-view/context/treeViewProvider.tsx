import React from 'react';
import { TreeViewContext } from './tree-view.context';

interface TreeViewProviderProps {
  viewIndex: number;
}

const TreeViewProvider: React.FC<TreeViewProviderProps> = ({
  children,
  viewIndex,
}) => {
  return (
    <TreeViewContext.Provider value={viewIndex}>
      {children}
    </TreeViewContext.Provider>
  );
};

export default TreeViewProvider;
