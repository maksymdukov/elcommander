import { useContext } from 'react';
import { TreeDNDContext } from '../context/tree-dnd.context';

export const useDndContext = () => useContext(TreeDNDContext);
