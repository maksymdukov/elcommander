import { useDispatch } from 'react-redux';
import { ScrollRef } from '../types/scroll-ref';
import { TreeEventType } from '../../../enums/tree-event-type.enum';
import { LassoContextState } from '../context/lasso.context';
import { OPENABLE_NODE_TYPES } from '../tree-view.constants';
import { useFsManagerCtx } from './use-fs-manager-ctx.hook';
import {
  closeDirThunk,
  enterDirByCursorThunk,
  enterDirByNodeIndex,
  exitDirThunk,
  openDirThunk,
  toggleDirByCursorThunk,
} from '../../../redux/features/views/actions/tree-dir.actions';
import {
  moveCursorThunk,
  setCursoredAction,
  setItemCursoredByClick,
} from '../../../redux/features/views/actions/tree-cursor.action';
import {
  selectAndMoveCursorThunk,
  selectFromToThunk,
  toggleSelectionAction,
} from '../../../redux/features/views/actions/tree-selection.actions';

interface UseContainerProps {
  scrollRef: ScrollRef;
  viewIndex: number;
  lassoState: LassoContextState;
}

export const useTreeHandlers = ({
  scrollRef,
  viewIndex,
  lassoState,
}: UseContainerProps) => {
  const { fsManager } = useFsManagerCtx();
  const dispatch = useDispatch();
  const onKeyDown = (e: React.KeyboardEvent) => {
    // Shift + Down
    if (e.key === 'ArrowDown' && e.shiftKey) {
      e.preventDefault();
      dispatch(selectAndMoveCursorThunk(viewIndex, scrollRef));
      return;
    }

    // Shift + Up
    if (e.key === 'ArrowUp' && e.shiftKey) {
      e.preventDefault();
      dispatch(selectAndMoveCursorThunk(viewIndex, scrollRef, false));
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      dispatch(moveCursorThunk(true, viewIndex, scrollRef));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      dispatch(moveCursorThunk(false, viewIndex, scrollRef));
      return;
    }
    // right
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      dispatch(toggleDirByCursorThunk(viewIndex, true, fsManager));
      return;
    }
    // enter
    if (e.key === 'Enter') {
      e.preventDefault();
      dispatch(enterDirByCursorThunk(viewIndex, fsManager));
    }
    // backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      dispatch(exitDirThunk(viewIndex, fsManager));
    }
    // left
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      dispatch(toggleDirByCursorThunk(viewIndex, false, fsManager));
      return;
    }

    // Space
    if (e.key === ' ') {
      e.preventDefault();
      dispatch(selectAndMoveCursorThunk(viewIndex, scrollRef));
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!e.treeEventType) {
      if (lassoState.startLasso) {
        lassoState.startLasso(e, null);
      }
      return;
    }

    if (e.treeEventType === TreeEventType.MoveSelectionMaybeStart) {
      dispatch(setCursoredAction({ viewIndex, index: e.treeIndex }));
    }

    if (e.treeEventType === TreeEventType.LassoSelectStart) {
      if (lassoState.startLasso) {
        lassoState.startLasso(e, e.treeIndex);
      }
    }
  };

  const onClick = (e: React.MouseEvent) => {
    if (!e.treeEventType) {
      return;
    }

    const { treeIndex } = e;

    if (e.treeEventType === TreeEventType.ItemCtrlSelect) {
      dispatch(toggleSelectionAction({ viewIndex, index: treeIndex }));
      return;
    }

    if (e.treeEventType === TreeEventType.ItemShiftSelect) {
      // select from cursor to clicked item;
      dispatch(selectFromToThunk(treeIndex, viewIndex));
      return;
    }

    if (e.treeEventType === TreeEventType.OpenNode) {
      dispatch(openDirThunk(treeIndex, viewIndex, fsManager));
      return;
    }

    if (e.treeEventType === TreeEventType.CloseNode) {
      dispatch(closeDirThunk(treeIndex, viewIndex, fsManager));
      return;
    }

    if (e.treeEventType === TreeEventType.ItemCursorSelect) {
      dispatch(setItemCursoredByClick(treeIndex, viewIndex));
    }
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    if (!e.treeEventType) {
      return;
    }
    const { treeNode, treeIndex } = e;
    if (
      e.treeEventType === TreeEventType.EnterNode &&
      OPENABLE_NODE_TYPES.includes(treeNode.type)
    ) {
      dispatch(enterDirByNodeIndex(treeIndex, viewIndex, fsManager));
    }
  };

  const getContainerProps = () => ({
    onKeyDown,
    onMouseDown,
    onClick,
    onDoubleClick,
  });
  return { getContainerProps };
};
