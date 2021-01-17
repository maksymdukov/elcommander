import { PayloadAction } from '@reduxjs/toolkit';
import { IFSBackendDescriptor } from '../../../../backends/backends-map';
import { IUserPluginConfig } from '../../../../plugins/plugin-persistence';

export type AddViewAction = PayloadAction<{
  backend: IFSBackendDescriptor;
  config?: IUserPluginConfig;
}>;

export type RemoveViewAction = PayloadAction<{
  viewIndex: number;
}>;
