import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
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
  console.log('viewIds', viewIds);
  return (
    <TreeContextProvider treeContainerRef={treeContainerRef}>
      <div ref={treeContainerRef} className={classes.treeContainer}>
        {viewIds.map((viewId, idx) => (
          <TreeView key={viewId} viewId={viewId} index={idx} />
        ))}
      </div>
      <DndAutoScroll />
    </TreeContextProvider>
  );
};

export default Main;
