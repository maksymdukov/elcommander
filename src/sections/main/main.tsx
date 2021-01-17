import React from 'react';
import { useSelector } from 'react-redux';
import TreeDndProvider from 'views/tree-view/context/tree-dnd.provider';
import DndPreviewIcon from 'views/tree-view/components/dnd-preview-icon';
import { getViewIds } from 'store/features/views/views.selectors';
import TreeView from 'views/tree-view/tree.view';
import DndAutoScroll from 'views/tree-view/components/dnd-auto-scroll';
import { useStyles } from './main.styles';

const getFlexBasis = (viewsNumber: number) => 100 / viewsNumber;

const Main = () => {
  const classes = useStyles();
  // unless number off views changes - dont re-render
  const viewIds = useSelector(
    getViewIds,
    (left, right) => left.length === right.length
  );
  return (
    <TreeDndProvider>
      <div className={classes.treeContainer}>
        {viewIds.map((viewId, idx) => (
          <div
            key={viewId}
            className={classes.tabView}
            style={{
              flexBasis: `${getFlexBasis(viewIds.length)}%`,
              width: `${getFlexBasis(viewIds.length)}%`,
            }}
          >
            <TreeView viewId={viewId} index={idx} />
          </div>
        ))}
      </div>
      <DndPreviewIcon />
      <DndAutoScroll />
    </TreeDndProvider>
  );
};

export default Main;
