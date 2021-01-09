import { useDispatch } from 'react-redux';
import {
  closeDirThunk,
  moveCursorThunk,
  openDirThunk,
  selectAndMoveCursorThunk,
  selectFromToThunk,
  setCursoredAction,
  setItemCursoredByClick,
  toggleDirByCursorThunk,
  toggleSelectionAction,
} from '../../../redux/features/views/tree-state.actions';
import { ScrollRef } from '../types/scroll-ref';
import { TreeEventType } from '../../../enums/tree-event-type.enum';
import { LassoContextState } from '../context/lasso.context';

interface UseContainerProps {
  scrollRef: ScrollRef;
  viewIndex: number;
  lassoState: LassoContextState;
}

export const useContainer = ({
  scrollRef,
  viewIndex,
  lassoState,
}: UseContainerProps) => {
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
      dispatch(toggleDirByCursorThunk(viewIndex));
      return;
    }
    // left
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      dispatch(toggleDirByCursorThunk(viewIndex, false));
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
      dispatch(openDirThunk(treeIndex, viewIndex));
      return;
    }

    if (e.treeEventType === TreeEventType.CloseNode) {
      dispatch(closeDirThunk(treeIndex, viewIndex));
      return;
    }

    if (e.treeEventType === TreeEventType.ItemCursorSelect) {
      dispatch(setItemCursoredByClick(treeIndex, viewIndex));
    }
  };

  const getContainerProps = () => ({
    onKeyDown,
    onMouseDown,
    onClick,
  });
  return { getContainerProps };
};
