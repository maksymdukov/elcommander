import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { removeViewAction } from 'store/features/views/views.slice';
import { initializeViewThunk } from 'store/features/views/actions/tree-dir.actions';
import DashSpinner from 'components/animated/dash-spinner';
import Button from 'components/buttons/button';
import FsPluginCtxProvider from './context/fs-plugin-ctx.provider';
import TreeViewProvider from './context/treeViewProvider';
import TreeList from './tree-list';
import { useStyles } from './tree-view.styles';
import StatusBar from './components/status-bar';
import { useDependencyInjection } from './hook/use-dependency-injection.hook';
import { FsPlugin } from '../../backends/abstracts/fs-plugin.abstract';

interface TreeViewProps {
  index: number;
  viewId: string;
}

function TreeViewRaw({ index, viewId }: TreeViewProps) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const {
    fsPlugin,
    instantiating,
    initializing,
    fsPluginDescriptor,
  } = useDependencyInjection({
    index,
    viewId,
    onSuccessfulInit: useCallback(
      (fsPlug: FsPlugin, viewIndex: number) => {
        dispatch(initializeViewThunk(viewIndex, fsPlug));
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
    !fsPlugin &&
    fsPluginDescriptor &&
    fsPluginDescriptor.klass.pluginOptions.tabSpinner
  )
    return (
      <div className={classes.spinnerContainer}>
        <DashSpinner />
        <span>Initializing tab...</span>
      </div>
    );

  if (
    initializing &&
    fsPlugin &&
    fsPluginDescriptor &&
    fsPluginDescriptor.klass.pluginOptions.tabSpinner
  )
    return (
      <div className={classes.spinnerContainer}>
        <DashSpinner />
        <span>Loading tab...</span>
        {fsPluginDescriptor.klass.pluginOptions.initCancellable && (
          <Button color="error" onClick={() => fsPlugin.cancelInitialization()}>
            Cancel
          </Button>
        )}
      </div>
    );

  if (instantiating || initializing || !fsPlugin) {
    return null;
  }
  return (
    <FsPluginCtxProvider fsPlugin={fsPlugin}>
      <TreeViewProvider viewIndex={index}>
        <StatusBar />
        <div className={classes.treeViewContainer}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <TreeList index={index} height={height} fsPlugin={fsPlugin} />
            )}
          </AutoSizer>
        </div>
      </TreeViewProvider>
    </FsPluginCtxProvider>
  );
}
const TreeView = React.memo(TreeViewRaw);
export default TreeView;
