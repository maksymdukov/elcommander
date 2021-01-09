import { useContext } from 'react';
import { LassoContext } from '../context/lasso.context';

export const useLassoContext = () => useContext(LassoContext);
