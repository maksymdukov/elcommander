import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { removeViewAction } from 'store/features/views/views.slice';
import { FSBackend } from 'backends/abstracts/fs-backend.abstract';
import { initializeViewThunk } from 'store/features/views/actions/tree-dir.actions';
import {
  getViewClassId,
  getViewConfigName,
} from 'store/features/views/views.selectors';
import { RootState } from 'store/root-types';
import { getFSBackendsMap, IFSBackendDescriptor } from 'backends/backends-map';
import { PluginPersistence } from 'plugins/plugin-persistence';
import DashSpinner from 'components/animated/dash-spinner';
import { unstable_batchedUpdates } from 'react-dom';
import FsManagerCtxProvider from './context/fs-manager-ctx.provider';
import TreeViewProvider from './context/treeViewProvider';
import TreeList from './tree-list';
import { useStyles } from './tree-view.styles';
import StatusBar from './components/status-bar';
import { usePreviousValue } from '../../utils/use-previous-value.hook';

interface TreeViewProps {
  index: number;
  viewId: string;
}

function TreeViewRaw({ index, viewId }: TreeViewProps) {
  const classes = useStyles();
  const [
    fsBackendDescriptor,
    setFsBackendDescriptor,
  ] = useState<IFSBackendDescriptor | null>(null);
  const [fsManager, setFsManager] = useState<FSBackend | null>(null);
  const prevFsManager = usePreviousValue(fsManager);
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
      console.log('instantiate fsManager');
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
        try {
          await instance.onInit();
          unstable_batchedUpdates(() => {
            setFsManager(instance);
            setInstantiating(false);
          });
          // TODO
          // dispatch this.configName save
        } catch (e) {
          // dispatch removeView action
          dispatch(removeViewAction({ viewIndex: index }));
          // TODO
          // dispatch error notification
        }
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
    if (fsManager && fsManager !== prevFsManager && !instantiating) {
      dispatch(initializeViewThunk(index, fsManager));
    }
  }, [dispatch, fsManager, index, instantiating, prevFsManager]);

  if (
    instantiating &&
    fsBackendDescriptor &&
    fsBackendDescriptor.klass.tabOptions.tabSpinner
  )
    return (
      <div className={classes.spinnerContainer}>
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
        <StatusBar />
        <div className={classes.treeViewContainer}>
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
