import { PayloadAction } from '@reduxjs/toolkit';
import { IFSPluginDescriptor } from 'plugins/fs/backends-map';
import { TreeNode } from 'interfaces/node.interface';

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
