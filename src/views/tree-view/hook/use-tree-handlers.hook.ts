import { useDispatch } from 'react-redux';
import { TreeEventType } from 'enums/tree-event-type.enum';
import {
  closeDirThunk,
  enterDirByCursorThunk,
  enterDirByNodeIndex,
  exitToParentThunk,
  openDirThunk,
  toggleDirByCursorThunk,
} from 'store/features/views/actions/tree-dir.actions';
import {
  moveCursorThunk,
  setCursoredAction,
  setItemCursoredByClick,
} from 'store/features/views/actions/tree-cursor.action';
import {
  selectAndMoveCursorThunk,
  selectFromToThunk,
  toggleSelectionAction,
} from 'store/features/views/actions/tree-selection.actions';
import { ScrollRef } from '../types/scroll-ref';
import { LassoContextState } from '../context/lasso.context';
import { OPENABLE_NODE_TYPES } from '../tree-view.constants';
import { useFsPluginCtx } from './use-fs-manager-ctx.hook';

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
  const { fsPlugin } = useFsPluginCtx();
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
      dispatch(toggleDirByCursorThunk(viewIndex, true, fsPlugin));
      return;
    }
    // enter
    if (e.key === 'Enter') {
      e.preventDefault();
      dispatch(enterDirByCursorThunk(viewIndex, fsPlugin));
    }
    // backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      dispatch(exitToParentThunk(viewIndex, fsPlugin));
    }
    // left
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      dispatch(toggleDirByCursorThunk(viewIndex, false, fsPlugin));
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
      dispatch(openDirThunk(treeIndex, viewIndex, fsPlugin));
      return;
    }

    if (e.treeEventType === TreeEventType.CloseNode) {
      dispatch(closeDirThunk(treeIndex, viewIndex, fsPlugin));
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
      dispatch(enterDirByNodeIndex(treeIndex, viewIndex, fsPlugin));
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
