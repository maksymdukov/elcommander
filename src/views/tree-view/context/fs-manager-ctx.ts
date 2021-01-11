import { createContext } from 'react';
import { FSBackend } from '../../../backends/interfaces/fs-backend.interface';
import { LocalFs } from '../../../backends/local-fs';

export interface IFsManagerCtxVal {
  fsManager: FSBackend;
}

export const FsManagerCtx = createContext<IFsManagerCtxVal>({
  fsManager: new LocalFs({ viewId: '0' }),
});
