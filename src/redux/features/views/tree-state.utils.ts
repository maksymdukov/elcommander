import { TreeState } from './tree-state.interface';

/*
  returns either parentId if dir is empty or a found childId
 */
export const findDeepestOpenedChildId = (
  state: TreeState,
  parentId: string
): string => {
  const parent = state.byIds[parentId];

  // empty dir
  if (!parent.children.length) {
    return parentId;
  }

  // last child is closed dir
  const lastChildId = parent.children[parent.children.length - 1];
  if (!state.byIds[lastChildId].isOpened) {
    return lastChildId;
  }

  return findDeepestOpenedChildId(state, lastChildId);
};

export const updateCursorPosition = (state: TreeState, cb: () => void) => {
  // save old position
  let oldCursorId: null | string = null;
  if (state.cursor !== null) {
    oldCursorId = state.allIds[state.cursor];
  }
  cb();
  // update cursor position
  if (oldCursorId) {
    state.cursor = state.allIds.findIndex((id) => id === oldCursorId);
  }
};

interface ChangeSelectionFromTo {
  state: TreeState;
  isSelect: boolean;
  start: number;
  end?: number;
  fwd: boolean;
}

export const changeSelectionFromTo = ({
  state,
  isSelect,
  start,
  end,
  fwd,
}: ChangeSelectionFromTo) => {
  let arrayBound = fwd ? state.allIds.length - 1 : 0;
  if (end) {
    arrayBound = end;
  }
  const arrayBoundsPredicate = fwd
    ? (idx: number) => idx <= arrayBound
    : (idx: number) => idx >= arrayBound;
  const predicate = isSelect
    ? (id: string, idx: number) =>
        !state.selectedIds.has(id) && arrayBoundsPredicate(idx)
    : (id: string, idx: number) =>
        state.selectedIds.has(id) && arrayBoundsPredicate(idx);
  const method = isSelect ? 'add' : 'delete';
  let toChangeId = state.allIds[start];
  let toChangeIdx = start;
  while (predicate(toChangeId, toChangeIdx)) {
    state.selectedIds[method](toChangeId);
    state.byIds[toChangeId].isSelected = isSelect;
    toChangeIdx += fwd ? 1 : -1;
    toChangeId = state.allIds[toChangeIdx];
  }
};
