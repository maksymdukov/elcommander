import { createContext } from 'react';
import { FsPlugin } from '../../../backends/abstracts/fs-plugin.abstract';

export interface IFsPluginCtxVal {
  fsPlugin: FsPlugin;
}

export const FsPluginCtx = createContext<IFsPluginCtxVal>({
  // @ts-ignore
  fsPlugin: null,
});
