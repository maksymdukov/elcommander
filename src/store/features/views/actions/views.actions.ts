import { PayloadAction } from '@reduxjs/toolkit';
import { IFSPluginDescriptor } from 'plugins/plugin-map';
import { TreeNode } from 'elcommander-plugin-sdk';

export type AddViewAction = PayloadAction<{
  backend: IFSPluginDescriptor;
  config?: string;
  startNode?: TreeNode;
}>;

export type RemoveViewAction = PayloadAction<{
  viewIndex: number;
}>;

export type ResizeViewAction = PayloadAction<{
  viewIndex: number;
  viewWidth: number;
  prevViewWidth: number;
}>;
