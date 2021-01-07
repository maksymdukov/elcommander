import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TreeDNDContext } from './tree-dnd.context';
import {
  DNDPreviewState,
  DNDState,
} from '../interfaces/tree-dnd-state.interface';
import DndPreviewProvider from './dnd-preview.provider';
import { CtxRef } from '../interfaces/tree-dnd-context-val.interface';

const TreeDndProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<DNDState>({
    isDroppable: false,
  });

  const [mouseState, setMouseState] = useState<DNDPreviewState>({
    mouseX: null,
    mouseY: null,
  });

  const ctxRef = useRef<CtxRef>({
    isActive: false,
  });

  const setMouseCoords = useCallback(
    (x: DNDPreviewState['mouseX'], y: DNDPreviewState['mouseY']) => {
      setMouseState((oldState) => ({
        ...oldState,
        mouseX: x,
        mouseY: y,
      }));
    },
    [setMouseState]
  );

  const setIsDroppable = useCallback(
    (isDroppable: boolean) => {
      setState((oldState) => ({
        ...oldState,
        isDroppable,
      }));
    },
    [setState]
  );

  const memoizedState = useMemo(
    () => ({
      state,
      setMouseCoords,
      setIsDroppable,
      ctxRef,
    }),
    [state, setMouseCoords, setIsDroppable, ctxRef]
  );
  return (
    <TreeDNDContext.Provider value={memoizedState}>
      <DndPreviewProvider previewState={mouseState}>
        {children}
      </DndPreviewProvider>
    </TreeDNDContext.Provider>
  );
};

export default TreeDndProvider;
