import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FSBackend } from '../../backends/interfaces/fs-backend.interface';
import TreeList from './tree-list';
import TreeViewProvider from './context/treeViewProvider';
import FsManagerCtxProvider from './context/fs-manager-ctx.provider';
import { initializeViewThunk } from '../../redux/features/views/actions/tree-dir.actions';
import ViewPath from './components/view-path';

interface TreeViewProps {
  fsManager: FSBackend;
  index: number;
}

function TreeViewRaw({ fsManager, index }: TreeViewProps) {
  const dispatch = useDispatch();
  useEffect(() => {
    // initialize first dir

    // TODO initialize view by viewId
    dispatch(initializeViewThunk(index, fsManager));
  }, [dispatch, fsManager]);
  return (
    <FsManagerCtxProvider fsManager={fsManager}>
      <TreeViewProvider viewIndex={index}>
        <div className="tree-view">
          <ViewPath index={index} />
          <div style={{ flex: '1 1 auto' }}>
            <AutoSizer disableWidth>
              {({ height }) => (
                <TreeList index={index} height={height} fsManager={fsManager} />
              )}
            </AutoSizer>
          </div>
        </div>
      </TreeViewProvider>
    </FsManagerCtxProvider>
  );
}
const TreeView = React.memo(TreeViewRaw);
export default TreeView;
