import { useContext } from 'react';
import { TreeDndHandlersContext } from '../context/tree-dnd-handlers.context';

export const useDndNodeHandlers = () => useContext(TreeDndHandlersContext);
