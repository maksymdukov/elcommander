import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FSBackend } from '../../backends/abstracts/fs-backend.abstract';
import TreeList from './tree-list';
import TreeViewProvider from './context/treeViewProvider';
import FsManagerCtxProvider from './context/fs-manager-ctx.provider';
import { initializeViewThunk } from '../../redux/features/views/actions/tree-dir.actions';
import ViewPath from './components/view-path';
import {
  getViewClassId,
  getViewConfigName,
} from '../../redux/features/views/views.selectors';
import { RootState } from '../../redux/root-types';
import {
  getFSBackendsMap,
  IFSBackendDescriptor,
} from '../../backends/backends-map';
import DashSpinner from '../../components/animated/dash-spinner';
import { removeViewAction } from '../../redux/features/views/views.slice';
import './tree-view.global.scss';
import { PluginPersistence } from '../../plugins/plugin-persistence';

interface TreeViewProps {
  index: number;
  viewId: string;
}

function TreeViewRaw({ index, viewId }: TreeViewProps) {
  const [
    fsBackendDescriptor,
    setFsBackendDescriptor,
  ] = useState<IFSBackendDescriptor | null>(null);
  const [fsManager, setFsManager] = useState<FSBackend | null>(null);
  const [instantiating, setInstantiating] = useState(false);
  const dispatch = useDispatch();
  const classId = useSelector((state: RootState) =>
    getViewClassId(state, index)
  );
  const configName = useSelector((state: RootState) =>
    getViewConfigName(state, index)
  );

  // DI
  useEffect(() => {
    // instantiate fsManager
    if (!fsManager && !instantiating) {
      setInstantiating(true);
      (async () => {
        const FSBackendsMap = await getFSBackendsMap();
        setFsBackendDescriptor(FSBackendsMap[classId]);
        const FsBackendClass = FSBackendsMap[classId].klass;
        // our app's global class to allow plugins access to fs
        const pluginPersistence = new PluginPersistence(
          FsBackendClass.Persistence.category,
          FsBackendClass.Persistence.dirName
        );
        // implementation of plugin's specific persistence class
        const persistence = new FsBackendClass.Persistence(pluginPersistence);
        const instance = await FsBackendClass.createInstance({
          viewId,
          persistence,
          configName,
        });
        setFsManager(instance);
        try {
          await instance.onInit();
          // TODO
          // dispatch this.configName save
        } catch (e) {
          // dispatch removeView action
          dispatch(removeViewAction({ viewIndex: index }));
          // TODO
          // dispatch error notification
          return;
        }
        setFsManager(instance);
        setInstantiating(false);
      })();
    }
  }, [
    dispatch,
    fsManager,
    classId,
    configName,
    instantiating,
    viewId,
    setFsBackendDescriptor,
    index,
  ]);

  // cleanup
  useEffect(() => {
    return () => {
      if (fsManager) {
        fsManager.onDestroy();
      }
    };
  }, [fsManager]);

  // initialize first dir
  useEffect(() => {
    if (fsManager && !instantiating) {
      dispatch(initializeViewThunk(index, fsManager));
    }
  }, [dispatch, fsManager, index, instantiating]);

  if (
    instantiating &&
    fsBackendDescriptor &&
    fsBackendDescriptor.klass.tabOptions.tabSpinner
  )
    return (
      <div className="spinner-container">
        <DashSpinner />
        <span>Loading tab...</span>
      </div>
    );

  if (instantiating || !fsManager) {
    return null;
  }

  return (
    <FsManagerCtxProvider fsManager={fsManager}>
      <TreeViewProvider viewIndex={index}>
        <ViewPath index={index} />
        <div className="tree-view-container">
          <AutoSizer disableWidth>
            {({ height }) => (
              <TreeList index={index} height={height} fsManager={fsManager} />
            )}
          </AutoSizer>
        </div>
      </TreeViewProvider>
    </FsManagerCtxProvider>
  );
}
const TreeView = React.memo(TreeViewRaw);
export default TreeView;
