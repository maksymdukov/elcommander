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
    let arrayBound = fwd ? state.allPath.length - 1 : 0;
    if (end) {
      arrayBound = end;
    }
    const arrayBoundsPredicate = fwd
      ? (idx: number) => idx <= arrayBound
      : (idx: number) => idx >= arrayBound;
    const predicate = isSelect
      ? (path: string, idx: number) =>
          !state.selectedPaths.has(path) && arrayBoundsPredicate(idx)
      : (path: string, idx: number) =>
          state.selectedPaths.has(path) && arrayBoundsPredicate(idx);
    const method = isSelect ? 'add' : 'delete';
    let toChangePath = state.allPath[start];
    let toChangeIdx = start;
    while (predicate(toChangePath, toChangeIdx)) {
      state.selectedPaths[method](toChangePath);
      state.byPath[toChangePath].isSelected = isSelect;
      toChangeIdx += fwd ? 1 : -1;
      toChangePath = state.allPath[toChangeIdx];
    }
  }

  static resetSelection(state: TreeState) {
    state.selectedPaths.forEach((path) => {
      state.byPath[path].isSelected = false;
    });
    TreeStateUtils.resetTreeStateBy(state, { selectedPaths: true });
  }
}
