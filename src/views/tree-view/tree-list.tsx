import React, { RefObject, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FixedSizeList } from 'react-window';
import { RootState } from '../../redux/root-types';
import { getAllIdxByIndex } from '../../redux/features/views/views.selectors';
import TreeListItem from './components/tree-list-item';
import { useContainer } from './hook/use-container.hook';
import CustomInnerWindow from './components/custom-inner-window';
import { LassoContextRef, LassoContextState } from './context/lasso.context';
import LassoContextProvider from './context/lasso-context.provider';
import { IFSBackend } from '../../backends/interfaces/fs-backend.interface';
import Droppable from './context/droppable';
import { useDnd } from './hook/use-dnd.hook';
import { setCursoredAction } from '../../redux/features/views/tree-state.actions';

interface TreeListProps {
  index: number;
  height: number;
  fsManager: IFSBackend;
  itemSize?: number;
}

const TreeList: React.FC<TreeListProps> = ({
  index,
  height,
  itemSize = 40,
}) => {
  const dispatch = useDispatch();
  const allIds = useSelector((state: RootState) =>
    getAllIdxByIndex(state, index)
  );

  const { getDndHandlers, getNodeHandlers } = useDnd({
    onInitialMouseDown: (nodeIdx) =>
      dispatch(setCursoredAction({ viewIndex: index, index: nodeIdx })),
    onNodeDragEnter: (n) => console.log('enter', n),
    onNodeDragLeave: (n) => console.log('leave', n),
    onNodeDrop: (n) => console.log('drop', n),
    droppableFilter: (start, end) => start !== end,
  });

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

  const { getContainerProps } = useContainer({
    scrollRef,
    viewIndex: index,
    lassoState,
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
          tabIndex={0}
          {...getContainerProps()}
          {...getDndHandlers()}
          style={{ height }}
        >
          <FixedSizeList
            ref={scrollRef}
            outerRef={outerRef}
            innerElementType={CustomInnerWindow}
            itemCount={allIds.length}
            onScroll={lassoState.onScroll}
            height={height}
            itemData={itemData}
            itemSize={itemSize}
            overscanCount={5}
            width="100%"
          >
            {TreeListItem}
          </FixedSizeList>
        </div>
      </LassoContextProvider>
    </Droppable>
  );
};

export default TreeList;
