import { useContext } from 'react';
import { FsPluginCtx } from '../context/fs-plugin-ctx';

export const useFsPluginCtx = () => useContext(FsPluginCtx);
