import { useContext } from 'react';
import { DroppableContext } from '../context/droppable.context';

export const useDndNodeHandlers = () => useContext(DroppableContext);
