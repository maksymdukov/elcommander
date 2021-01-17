import { MutableRefObject } from 'react';
import { useDispatch } from 'react-redux';
import { TreeNode } from 'interfaces/node.interface';
import { setCursoredAction } from 'store/features/views/actions/tree-cursor.action';
import { toggleNodeHighlightAction } from 'store/features/views/actions/tree-selection.actions';
import { useCurrentValue } from 'utils/use-current-value.hook';
import { UNDROPPABLE_NODE_TYPES } from '../tree-view.constants';
import { useDnd } from './use-dnd.hook';
import { useDndContext } from './use-dnd-context.hook';

interface UseTreeDndProps {
  viewIndex: number;
  scrollableRef: MutableRefObject<HTMLDivElement | undefined>;
}

export const droppableFilter = ({
  startNodeIndex,
  currentNode,
  currentNodeIndex,
}: {
  startNodeIndex: number | null;
  currentNode: TreeNode;
  currentNodeIndex: number;
}) =>
  startNodeIndex !== currentNodeIndex &&
  !UNDROPPABLE_NODE_TYPES.includes(currentNode.type);

export const useTreeDnd = ({ viewIndex, scrollableRef }: UseTreeDndProps) => {
  const dispatch = useDispatch();
  const viewIndexCurrent = useCurrentValue(viewIndex);
  const { setContainerElement } = useDndContext();
  const { getDndHandlers, getNodeHandlers } = useDnd({
    onInitialMouseDown: (nodeIdx) => {
      dispatch(
        setCursoredAction({
          viewIndex: viewIndexCurrent.current,
          index: nodeIdx,
        })
      );
      // save current active container ref
      if (scrollableRef.current) {
        setContainerElement(scrollableRef.current);
      }
    },
    onNodeDragEnter: (nodeIndex) =>
      dispatch(
        toggleNodeHighlightAction({
          viewIndex: viewIndexCurrent.current,
          index: nodeIndex,
        })
      ),
    onNodeDragLeave: (nodeIndex) =>
      dispatch(
        toggleNodeHighlightAction({
          viewIndex: viewIndexCurrent.current,
          index: nodeIndex,
        })
      ),
    onNodeDrop: (nodeIndex) => {
      dispatch(
        toggleNodeHighlightAction({
          viewIndex: viewIndexCurrent.current,
          index: nodeIndex,
        })
      );
      console.log('drop on node index:', nodeIndex);
    },
    droppableFilter,
    onContainerEnter: () => {
      if (scrollableRef.current) {
        setContainerElement(scrollableRef.current);
      }
    },
    onContainerLeave: () => {
      setContainerElement(null);
    },
    onContainerDrop: () => {
      console.log('drop on container index:', viewIndexCurrent.current);
    },
    onDndFinish: () => {
      setContainerElement(null);
    },
    onNodeExternalDragEnter: (index) => {
      dispatch(
        toggleNodeHighlightAction({
          viewIndex: viewIndexCurrent.current,
          index,
        })
      );
    },
    onNodeExternalDragLeave: (index) => {
      dispatch(
        toggleNodeHighlightAction({
          viewIndex: viewIndexCurrent.current,
          index,
        })
      );
    },
    onContainerExternalDrop: () =>
      console.log(
        'external container drop viewIndex:',
        viewIndexCurrent.current
      ),
    onNodeExternalDrop: (index) => {
      dispatch(
        toggleNodeHighlightAction({
          viewIndex: viewIndexCurrent.current,
          index,
        })
      );
      console.log(
        'external node drop index, viewIndex:',
        index,
        viewIndexCurrent.current
      );
    },
  });
  return { getDndHandlers, getNodeHandlers };
};
