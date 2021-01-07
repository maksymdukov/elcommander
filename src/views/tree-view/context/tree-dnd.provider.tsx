import React, { useCallback, useMemo, useState } from 'react';
import { TreeDNDContext } from './tree-dnd.context';
import DndPreviewIcon from '../../../components/tree/dnd-preview-icon';
import { TreeDNDState } from '../interfaces/tree-dnd-state.interface';

const TreeDndProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<TreeDNDState>({
    mouseX: null,
    mouseY: null,
    isDroppable: false,
  });

  const setMouseCoords = useCallback(
    (x: TreeDNDState['mouseX'], y: TreeDNDState['mouseY']) => {
      setState((oldState) => ({
        ...oldState,
        mouseX: x,
        mouseY: y,
      }));
    },
    [setState]
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
    }),
    [state, setMouseCoords, setIsDroppable]
  );
  return (
    <TreeDNDContext.Provider value={memoizedState}>
      {children}
      {state.mouseY !== null && state.mouseX !== null && (
        <DndPreviewIcon
          top={state.mouseY}
          left={state.mouseX}
          isDroppable={state.isDroppable}
        />
      )}
    </TreeDNDContext.Provider>
  );
};

export default TreeDndProvider;
