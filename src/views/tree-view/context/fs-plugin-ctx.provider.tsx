import React, { useMemo } from 'react';
import { FsPluginCtx, IFsPluginCtxVal } from './fs-plugin-ctx';

const FsPluginCtxProvider: React.FC<IFsPluginCtxVal> = ({
  fsPlugin,
  children,
}) => {
  const value = useMemo(() => ({ fsPlugin }), [fsPlugin]);
  return <FsPluginCtx.Provider value={value}>{children}</FsPluginCtx.Provider>;
};

export default FsPluginCtxProvider;
