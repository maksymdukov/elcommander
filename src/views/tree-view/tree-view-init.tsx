import React, { useEffect, useState } from 'react';
import { DirectoryNode } from '../../classes/dir-node';
import TreeView from './tree.view';
import { IFSBackend } from '../../backends/interfaces/fs-backend.interface';
import ContainerRefProvider from './context/container-ref.provider';

export interface TreeViewInitProps {
  localFs: IFSBackend;
}

const TreeViewInit = ({ localFs }: TreeViewInitProps) => {
  const [initTree, setInitTree] = useState<undefined | DirectoryNode>();
  useEffect(() => {
    (async () => {
      const initTreeNode: DirectoryNode = new DirectoryNode({
        name: '',
      });
      const children = await localFs.readDir(['/'], initTreeNode);
      initTreeNode.setChildren(children);
      setInitTree(initTreeNode);
    })();
  }, [localFs]);
  return (
    (initTree && (
      <ContainerRefProvider>
        <TreeView initTree={initTree} fsManager={localFs} />
      </ContainerRefProvider>
    )) ||
    null
  );
};

export default TreeViewInit;
