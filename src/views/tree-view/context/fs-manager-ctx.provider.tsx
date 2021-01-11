import React, { useMemo } from 'react';
import { FsManagerCtx, IFsManagerCtxVal } from './fs-manager-ctx';

const FsManagerCtxProvider: React.FC<IFsManagerCtxVal> = ({
  fsManager,
  children,
}) => {
  const value = useMemo(() => ({ fsManager }), [fsManager]);
  return (
    <FsManagerCtx.Provider value={value}>{children}</FsManagerCtx.Provider>
  );
};

export default FsManagerCtxProvider;
