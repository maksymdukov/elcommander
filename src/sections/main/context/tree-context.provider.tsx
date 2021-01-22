import React from 'react';
import { TreeContext, TreeContextVal } from './tree.context';

const TreeContextProvider: React.FC<TreeContextVal> = ({
  treeContainerRef,
  children,
}) => {
  return (
    <TreeContext.Provider value={{ treeContainerRef }}>
      {children}
    </TreeContext.Provider>
  );
};

export default TreeContextProvider;
