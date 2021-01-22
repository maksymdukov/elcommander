import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { useFsPluginInjection } from './hook/use-dependency-injection.hook';
import { FsPlugin } from '../../backends/abstracts/fs-plugin.abstract';
import { RootState } from '../../store/root-types';
import { getViewWidth } from '../../store/features/views/views.selectors';

interface TreeViewProps {
  index: number;
  viewId: string;
}

function TreeViewRaw({ index, viewId }: TreeViewProps) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const viewWidth = useSelector((state: RootState) =>
    getViewWidth(state, index)
  );

  const {
    fsPlugin,
    instantiating,
    initializing,
    fsPluginDescriptor,
  } = useFsPluginInjection({
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
        <div
          key={viewId}
          className={classes.tabView}
          tabIndex={0}
          style={{
            // flexBasis: `${getFlexBasis(viewIds.length)}%`,
            width: `${viewWidth}%`,
          }}
        >
          <StatusBar />
          <div className={classes.treeViewContainer}>
            <AutoSizer disableWidth>
              {({ height }) => (
                <TreeList index={index} height={height} fsPlugin={fsPlugin} />
              )}
            </AutoSizer>
          </div>
        </div>
      </TreeViewProvider>
    </FsPluginCtxProvider>
  );
}
const TreeView = React.memo(TreeViewRaw);
export default TreeView;
