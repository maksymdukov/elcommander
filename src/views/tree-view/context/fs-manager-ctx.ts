import { createContext } from 'react';
import { FSBackend } from '../../../backends/abstracts/fs-backend.abstract';
import { LocalFs } from '../../../backends/impls/local-fs/local-fs';

export interface IFsManagerCtxVal {
  fsManager: FSBackend;
}

export const FsManagerCtx = createContext<IFsManagerCtxVal>({
  fsManager: new LocalFs({ viewId: '0' }),
});
