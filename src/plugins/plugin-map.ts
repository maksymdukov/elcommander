import React, { SVGProps } from 'react';
import { LocalFsPlugin } from './fs/impls/local-fs/local-fs-plugin';
import { GoogleDrivePlugin } from './fs/impls/google-drive/google-drive-plugin';
import HardDriveIcon from '../components/icons/hard-drive-icon';
import GoogleDriveIcon from '../components/icons/google-drive-icon';
import { IFSPlugin } from './fs/abstracts/fs-plugin.abstract';

export interface IFSPluginDescriptor {
  id: string;
  name: string;
  klass: IFSPlugin;
  enabled: boolean;
  order: number;
  icon?: React.FC<SVGProps<SVGSVGElement>>;
}

export interface IFSPluginMap {
  [k: string]: IFSPluginDescriptor;
}

export const FSPluginsMap: IFSPluginMap = {
  LocalFS: {
    id: 'LocalFS',
    name: 'Local',
    klass: LocalFsPlugin,
    enabled: true,
    order: 1,
    icon: HardDriveIcon,
  },
  GoogleDriveFS: {
    id: 'GoogleDriveFS',
    name: 'Google',
    klass: GoogleDrivePlugin,
    enabled: true,
    order: 2,
    icon: GoogleDriveIcon,
  },
};

export const getFSPluginsMap = async () => {
  return FSPluginsMap;
};
