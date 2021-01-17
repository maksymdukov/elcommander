import { TreeState } from '../tree-state.interface';
import { TreeStateUtils } from './tree-state.utils';

interface ChangeSelectionFromTo {
  state: TreeState;
  isSelect: boolean;
  start: number;
  end?: number;
  fwd: boolean;
}

export class SelectionStateUtils {
  static changeSelectionFromTo({
    state,
    isSelect,
    start,
    end,
    fwd,
  }: ChangeSelectionFromTo) {
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
      state.byId[toChangeId].isSelected = isSelect;
      toChangeIdx += fwd ? 1 : -1;
      toChangeId = state.allIds[toChangeIdx];
    }
  }

  static resetSelection(state: TreeState) {
    state.selectedIds.forEach((path) => {
      state.byId[path].isSelected = false;
    });
    TreeStateUtils.resetTreeStateBy(state, { selectedIds: true });
  }
}
