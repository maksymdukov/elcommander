import React, { RefObject, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FixedSizeList } from 'react-window';
import { RootState } from 'store/root-types';
import { getAllPathByIndex } from 'store/features/views/views.selectors';
import { FsPlugin } from 'backends/abstracts/fs-plugin.abstract';
import TreeListItem from './components/tree-list-item';
import { useTreeHandlers } from './hook/use-tree-handlers.hook';
import CustomInnerWindow from './components/custom-inner-window';
import { LassoContextRef, LassoContextState } from './context/lasso.context';
import LassoContextProvider from './context/lasso-context.provider';
import Droppable from './context/droppable';
import { useTreeDnd } from './hook/use-tree-dnd.hook';
import AutoCursorScroll from './components/auto-cursor-scroll';
import PathSpinner from './components/path-spinner';
import { TABVIEW_BORDER_WIDTH, useStyles } from './tree-list.styles';
import ResizeHandle from './components/resize-handle';

interface TreeListProps {
  index: number;
  height: number;
  fsPlugin: FsPlugin;
  itemSize?: number;
}

const TreeList: React.FC<TreeListProps> = ({
  index,
  height,
  itemSize = 40,
}) => {
  const classes = useStyles();
  const allIds = useSelector((state: RootState) =>
    getAllPathByIndex(state, index)
  );

  // used in lasso
  const itemCfgRef = useRef({ count: 0, size: itemSize });
  itemCfgRef.current.count = allIds.length;
  itemCfgRef.current.size = itemSize;

  // instance with scrollTo lib method
  const scrollRef = useRef() as RefObject<FixedSizeList>;
  // window element with scrolling
  const outerRef = useRef<HTMLDivElement>();

  // pass refs and state to the lasso context
  const [lassoState, setLassoState] = useState<LassoContextState>({});
  const lassoRefs = useRef<LassoContextRef>({
    outerRef,
    itemCfgRef,
  });

  const { getContainerProps } = useTreeHandlers({
    scrollRef,
    viewIndex: index,
    lassoState,
  });

  const { getNodeHandlers, getDndHandlers } = useTreeDnd({
    viewIndex: index,
    scrollableRef: outerRef,
  });

  const itemData = useMemo(() => ({ allIds, viewIndex: index }), [
    allIds,
    index,
  ]);

  return (
    <Droppable {...getNodeHandlers()}>
      <LassoContextProvider
        refs={lassoRefs}
        state={lassoState}
        setState={setLassoState}
      >
        <div
          className={classes.treeList}
          tabIndex={0}
          {...getContainerProps()}
          {...getDndHandlers()}
          style={{ height }}
        >
          <ResizeHandle />
          <PathSpinner />
          <FixedSizeList
            ref={scrollRef}
            className={classes.scrollContainer}
            outerRef={outerRef}
            innerElementType={CustomInnerWindow}
            itemCount={allIds.length}
            onScroll={lassoState.onScroll}
            height={height - TABVIEW_BORDER_WIDTH * 2}
            itemData={itemData}
            itemSize={itemSize}
            overscanCount={5}
            width="100%"
          >
            {TreeListItem}
          </FixedSizeList>
        </div>
        <AutoCursorScroll scrollRef={scrollRef} index={index} />
      </LassoContextProvider>
    </Droppable>
  );
};

export default TreeList;
