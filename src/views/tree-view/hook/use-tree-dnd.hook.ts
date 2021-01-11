import { MutableRefObject } from 'react';
import { useDispatch } from 'react-redux';
import { useDnd } from './use-dnd.hook';
import { UNDROPPABLE_NODE_TYPES } from '../tree-view.constants';
import { useDndContext } from './use-dnd-context.hook';
import { TreeNode } from '../../../interfaces/node.interface';
import { setCursoredAction } from '../../../redux/features/views/actions/tree-cursor.action';
import { toggleNodeHighlightAction } from '../../../redux/features/views/actions/tree-selection.actions';

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
  const { setContainerElement } = useDndContext();
  const { getDndHandlers, getNodeHandlers } = useDnd({
    onInitialMouseDown: (nodeIdx) => {
      dispatch(setCursoredAction({ viewIndex, index: nodeIdx }));
      // save current active container ref
      if (scrollableRef.current) {
        setContainerElement(scrollableRef.current);
      }
    },
    onNodeDragEnter: (nodeIndex) =>
      dispatch(toggleNodeHighlightAction({ viewIndex, index: nodeIndex })),
    onNodeDragLeave: (nodeIndex) =>
      dispatch(toggleNodeHighlightAction({ viewIndex, index: nodeIndex })),
    onNodeDrop: (nodeIndex) => {
      dispatch(toggleNodeHighlightAction({ viewIndex, index: nodeIndex }));
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
      console.log('drop on container index:', viewIndex);
    },
    onDndFinish: () => {
      setContainerElement(null);
    },
    onNodeExternalDragEnter: (index) => {
      dispatch(toggleNodeHighlightAction({ viewIndex, index }));
    },
    onNodeExternalDragLeave: (index) => {
      dispatch(toggleNodeHighlightAction({ viewIndex, index }));
    },
    onContainerExternalDrop: () =>
      console.log('external container drop viewIndex:', viewIndex),
    onNodeExternalDrop: (index) => {
      dispatch(toggleNodeHighlightAction({ viewIndex, index }));
      console.log('external node drop index, viewIndex:', index, viewIndex);
    },
  });
  return { getDndHandlers, getNodeHandlers };
};
