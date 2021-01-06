/*
 * dir
 *   file
 *   dir
 *     file
 *     file
 *   dir
 *     file
 *     dir
 *       file
 *
 *  */

import { DirectoryNode } from '../../classes/dir-node';
import { TreeNode } from '../../classes/tree-node';

export const findNodeByPath = (path: number[], tree: DirectoryNode): TreeNode => {
  if (path.length) {
    const child = tree.getChildren()[path[0]] as DirectoryNode;
    return findNodeByPath(path.slice(1), child);
  }
  return tree;
};

const updateTreeByPath = (
  node: TreeNode,
  path: number[],
  cb: (nd: TreeNode) => TreeNode
): TreeNode => {
  if (path.length && node instanceof DirectoryNode) {
    const idx = path[0];
    node.updateNthChild(
      idx,
      updateTreeByPath(node.getNthChild(idx), path.slice(1), cb)
    );
    return node;
  }
  return cb(node);
};

export const toggleDirectory = (
  node: DirectoryNode,
  targetNode: DirectoryNode,
  children: TreeNode[]
): DirectoryNode => {
  const pathArr = targetNode.getPath();
  const newTree = updateTreeByPath(node, pathArr, (tNode) => {
    if (tNode instanceof DirectoryNode) {
      tNode.toggleOpen();
      if (tNode.isOpened) {
        tNode.setChildren(children);
      } else {
        // release memory
        tNode.setChildren([]);
      }
      return tNode;
    }
    throw new Error('Not a directory');
  });
  return newTree as DirectoryNode;
};

export const toggleItemAsCursor = (
  tree: DirectoryNode,
  targetNode: TreeNode
): DirectoryNode => {
  const pathArr = targetNode.getPath();
  const newTree = updateTreeByPath(tree, pathArr, (tNode) => {
    tNode.toggleCursor();
    return tNode;
  });
  return newTree as DirectoryNode;
};

export const toggleItemAsSelected = (
  tree: DirectoryNode,
  targetNode: TreeNode
): DirectoryNode => {
  const pathArr = targetNode.getPath();
  const newTree = updateTreeByPath(tree, pathArr, (tNode) => {
    tNode.toggleSelected();
    return tNode;
  });
  return newTree as DirectoryNode;
};

export const markItemAsSelected = (
  tree: DirectoryNode,
  targetNode: TreeNode
): DirectoryNode => {
  const pathArr = targetNode.getPath();
  const newTree = updateTreeByPath(tree, pathArr, (tNode) => {
    tNode.markSelected();
    return tNode;
  });
  return newTree as DirectoryNode;
};
