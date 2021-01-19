import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { removeViewAction } from 'store/features/views/views.slice';
import { FSBackend } from 'backends/abstracts/fs-backend.abstract';
import { initializeViewThunk } from 'store/features/views/actions/tree-dir.actions';
import DashSpinner from 'components/animated/dash-spinner';
import Button from 'components/buttons/button';
import FsManagerCtxProvider from './context/fs-manager-ctx.provider';
import TreeViewProvider from './context/treeViewProvider';
import TreeList from './tree-list';
import { useStyles } from './tree-view.styles';
import StatusBar from './components/status-bar';
import { useDependencyInjection } from './hook/use-dependency-injection.hook';

interface TreeViewProps {
  index: number;
  viewId: string;
}

function TreeViewRaw({ index, viewId }: TreeViewProps) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const {
    fsManager,
    instantiating,
    initializing,
    fsBackendDescriptor,
  } = useDependencyInjection({
    index,
    viewId,
    onSuccessfulInit: useCallback(
      (fsMgr: FSBackend, viewIndex: number) => {
        dispatch(initializeViewThunk(viewIndex, fsMgr));
      },
      [dispatch]
    ),
    onFailInit: useCallback(
      (_: any, viewIndex: number) => {
        dispatch(removeViewAction({ viewIndex }));
      },
      [dispatch]
    ),
  });
  if (
    instantiating &&
    !fsManager &&
    fsBackendDescriptor &&
    fsBackendDescriptor.klass.tabOptions.tabSpinner
  )
    return (
      <div className={classes.spinnerContainer}>
        <DashSpinner />
        <span>Initializing tab...</span>
      </div>
    );

  if (
    initializing &&
    fsManager &&
    fsManager.options.initCancellable &&
    fsBackendDescriptor &&
    fsBackendDescriptor.klass.tabOptions.tabSpinner
  )
    return (
      <div className={classes.spinnerContainer}>
        <DashSpinner />
        <span>Loading tab...</span>
        <Button color="error" onClick={() => fsManager.cancelInitialization()}>
          Cancel
        </Button>
      </div>
    );

  if (instantiating || initializing || !fsManager) {
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
