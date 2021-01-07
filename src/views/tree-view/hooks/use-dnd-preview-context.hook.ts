import { useContext } from 'react';
import { DndPreviewContext } from '../context/dnd-preview.context';

export const useDndPreviewContext = () => useContext(DndPreviewContext);
