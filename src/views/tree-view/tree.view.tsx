import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FSBackend } from '../../backends/abstracts/fs-backend.abstract';
import TreeList from './tree-list';
import TreeViewProvider from './context/treeViewProvider';
import FsManagerCtxProvider from './context/fs-manager-ctx.provider';
import { initializeViewThunk } from '../../redux/features/views/actions/tree-dir.actions';
import ViewPath from './components/view-path';
import { getViewName } from '../../redux/features/views/views.selectors';
import { RootState } from '../../redux/root-types';
import { FSBackendsMap } from '../../backends/backends-map';
import DashSpinner from '../../components/animated/dash-spinner';
import './tree-view.global.scss';

interface TreeViewProps {
  index: number;
  viewId: string;
}

function TreeViewRaw({ index, viewId }: TreeViewProps) {
  const [fsManager, setFsManager] = useState<FSBackend | null>(null);
  const [instantiating, setInstantiating] = useState(false);
  const dispatch = useDispatch();
  const viewName = useSelector((state: RootState) => getViewName(state, index));

  // DI
  useEffect(() => {
    // instantiate fsManager
    if (!fsManager && !instantiating) {
      setInstantiating(true);
      (async () => {
        const instance = await FSBackendsMap[viewName].createInstance({
          viewId,
        });
        setFsManager(instance);
        await instance.onInit();
        setInstantiating(false);
      })();
    }
  }, [fsManager, viewName, instantiating, viewId]);

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

  if (instantiating && FSBackendsMap[viewName].tabOptions.tabSpinner)
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
