import React from 'react';
import { FSPersistence } from './fs-persistence';
import { FSBackend } from './fs-backend.abstract';
import '../worker/worker-thread';

export interface IPluginCtorProps<
  F extends FSBackend = FSBackend,
  P extends FSPersistence = FSPersistence
> {
  viewId: string;
  configName: string;
  persistence: P;
  fs: F;
  domContainer: Element;
}

export interface IFSPluginOptions {
  pluginName: string;
  icon?: React.FC;
  tabSpinner?: boolean;
  pathSpinner?: boolean;
  treeSpinner?: boolean;
  initCancellable?: boolean;
}

export interface IFSPluginViewOptions {
  pathSpinner?: boolean;
  treeSpinner?: boolean;
}

export interface IFSPlugin {
  createInstance(prop: {
    viewId: string;
    configName: string;
    persistence: FSPersistence;
    domContainer: Element;
  }): Promise<FsPlugin>;
  FS: typeof FSBackend;
  Persistence: typeof FSPersistence;
  pluginOptions: IFSPluginOptions;
}

export abstract class FsPlugin<
  FS extends FSBackend = FSBackend,
  Persistence extends FSPersistence = FSPersistence
> {
  static Persistence: typeof FSPersistence = FSPersistence;

  static FS: typeof FSBackend;

  // async instantiation
  static async createInstance(..._: any[]): Promise<any> {
    throw new Error('must be implemented in the derived class');
  }

  public static get pluginOptions(): IFSPluginOptions {
    return {
      pluginName: 'Plugin Name',
      icon: () => null,
      tabSpinner: false,
      initCancellable: false,
    };
  }

  protected viewId: string;

  protected configName: string;

  protected persistence: Persistence;

  public fs: FS;

  protected domContainer: Element;

  public get options(): IFSPluginViewOptions {
    return {
      pathSpinner: false,
      treeSpinner: false,
    };
  }

  constructor({
    viewId,
    configName,
    persistence,
    domContainer,
    fs,
  }: IPluginCtorProps<FS, Persistence>) {
    this.persistence = persistence;
    this.fs = fs;
    this.viewId = viewId;
    this.configName = configName;
    this.domContainer = domContainer;
  }

  public async onInit(): Promise<void> {}

  public async onDestroy() {
    return this.fs.unwatchAllDir();
  }

  public async cancelInitialization(): Promise<void> {}
}
