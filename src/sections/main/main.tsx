import React from 'react';
import { useSelector } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { LocalFs } from '../../backends/local-fs';
import classes from './main.scss';
import TreeDndProvider from '../../views/tree-view/context/tree-dnd.provider';
import DndPreviewIcon from '../../views/tree-view/components/dnd-preview-icon';
import { getViewsSelector } from '../../redux/features/views/views.selectors';
import TreeView from '../../views/tree-view/tree.view';

const localFs = new LocalFs();

const Main = () => {
  const views = useSelector(getViewsSelector);
  return (
    <TreeDndProvider>
      <div className={classes.container}>
        <AutoSizer
          className={classes.AutoSizer}
          style={{ width: '100%', height: '100%' }}
        >
          {({ height }) =>
            views.map((_treeState, idx) => (
              <TreeView
                key={idx}
                fsManager={localFs}
                index={idx}
                height={height}
              />
            ))
          }
        </AutoSizer>
      </div>
      <DndPreviewIcon />
    </TreeDndProvider>
  );
};

export default Main;
