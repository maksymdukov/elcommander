import { useContext } from 'react';
import { TreeContext } from '../context/tree.context';

export const useTreeCtx = () => useContext(TreeContext);
