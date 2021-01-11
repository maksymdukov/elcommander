import { useContext } from 'react';
import { FsManagerCtx } from '../context/fs-manager-ctx';

export const useFsManagerCtx = () => useContext(FsManagerCtx);
