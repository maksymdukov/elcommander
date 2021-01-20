import { PayloadAction } from '@reduxjs/toolkit';
import { IFSPluginDescriptor } from 'backends/backends-map';
import { IUserPluginConfig } from 'plugins/plugin-persistence';

export type AddViewAction = PayloadAction<{
  backend: IFSPluginDescriptor;
  config?: IUserPluginConfig;
}>;

export type RemoveViewAction = PayloadAction<{
  viewIndex: number;
}>;
