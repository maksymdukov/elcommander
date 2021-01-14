import React from 'react';
import { useSelector } from 'react-redux';
import classes from './main.scss';
import TreeDndProvider from '../../views/tree-view/context/tree-dnd.provider';
import DndPreviewIcon from '../../views/tree-view/components/dnd-preview-icon';
import { getViewIds } from '../../redux/features/views/views.selectors';
import TreeView from '../../views/tree-view/tree.view';
import DndAutoScroll from '../../views/tree-view/components/dnd-auto-scroll';

const getFlexBasis = (viewsNumber: number) => 100 / viewsNumber;

const Main = () => {
  const viewIds = useSelector(
    getViewIds,
    (left, right) => left.length === right.length
  );
  return (
    <TreeDndProvider>
      <div className={classes.container}>
        {viewIds.map((viewId, idx) => (
          <div
            key={viewId}
            className="tab-view"
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
