import React from 'react';
import { IFSBackend } from '../../backends/interfaces/fs-backend.interface';
import TreeList from './tree-list';
import TreeViewProvider from './context/treeViewProvider';

interface TreeViewProps {
  fsManager: IFSBackend;
  index: number;
  height: number;
}

function TreeViewRaw({ fsManager, index, height }: TreeViewProps) {
  return (
    <TreeViewProvider viewIndex={index}>
      <TreeList index={index} height={height} fsManager={fsManager} />
    </TreeViewProvider>
  );
}
const TreeView = React.memo(TreeViewRaw);
export default TreeView;
