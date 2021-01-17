import React, { SVGProps } from 'react';
import { FSBackend } from './abstracts/fs-backend.abstract';
import { LocalFs } from './impls/local-fs/local-fs';
import { GoogleDriveFs } from './impls/google-drive/google-drive-fs';
import HardDriveIcon from '../components/icons/hard-drive-icon';
import GoogleDriveIcon from '../components/icons/google-drive-icon';

export interface IFSBackendDescriptor {
  id: string;
  name: string;
  klass: typeof FSBackend;
  enabled: boolean;
  order: number;
  icon: React.FC<SVGProps<SVGSVGElement>>;
}

export interface IFSManagers {
  [k: string]: IFSBackendDescriptor;
}

export const FSBackendsMap: IFSManagers = {
  LocalFS: {
    id: 'LocalFS',
    name: 'Local',
    // https://github.com/microsoft/TypeScript/issues/4628
    // @ts-ignore
    klass: LocalFs,
    enabled: true,
    order: 1,
    icon: HardDriveIcon,
  },
  GoogleDriveFS: {
    id: 'GoogleDriveFS',
    name: 'Google',
    // https://github.com/microsoft/TypeScript/issues/4628
    // @ts-ignore
    klass: GoogleDriveFs,
    enabled: true,
    order: 2,
    icon: GoogleDriveIcon,
  },
};

export const getFSBackendsMap = async () => {
  return FSBackendsMap;
};
