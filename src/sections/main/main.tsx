import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import TreeDndProvider from 'views/tree-view/context/tree-dnd.provider';
import DndPreviewIcon from 'views/tree-view/components/dnd-preview-icon';
import { getViewIds } from 'store/features/views/views.selectors';
import TreeView from 'views/tree-view/tree.view';
import DndAutoScroll from 'views/tree-view/components/dnd-auto-scroll';
import { useStyles } from './main.styles';
import TreeContextProvider from './context/tree-context.provider';

const Main = () => {
  const classes = useStyles();
  const treeContainerRef = useRef<HTMLDivElement | null>(null);
  // unless number off views changes - dont re-render
  const viewIds = useSelector(
    getViewIds,
    (left, right) => left.length === right.length
  );
  return (
    <TreeDndProvider>
      <TreeContextProvider treeContainerRef={treeContainerRef}>
        <div ref={treeContainerRef} className={classes.treeContainer}>
          {viewIds.map((viewId, idx) => (
            <TreeView key={viewId} viewId={viewId} index={idx} />
          ))}
        </div>
        <DndPreviewIcon />
        <DndAutoScroll />
      </TreeContextProvider>
    </TreeDndProvider>
  );
};

export default Main;
