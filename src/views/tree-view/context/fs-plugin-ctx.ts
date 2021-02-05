import { createContext } from 'react';
import { FsPlugin } from 'elcommander-plugin-sdk';

export interface IFsPluginCtxVal {
  fsPlugin: FsPlugin;
}

export const FsPluginCtx = createContext<IFsPluginCtxVal>({
  // @ts-ignore
  fsPlugin: null,
});
