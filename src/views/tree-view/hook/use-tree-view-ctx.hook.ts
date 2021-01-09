import { useContext } from 'react';
import { TreeViewContext } from '../context/tree-view.context';

export const useTreeViewCtx = () => useContext(TreeViewContext);
