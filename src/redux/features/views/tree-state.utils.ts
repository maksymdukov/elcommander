import { TreeState } from './tree-state.interface';
import { TreeNode } from '../../../interfaces/node.interface';

export class TreeStateUtils {
  static getNodeByIndex(state: TreeState, index: number) {
    return state.byIds[state.allIds[index]];
  }

  static resetTreeStateBy(
    state: TreeState,
    by: { [K in keyof TreeState]?: true }
  ) {
    Object.keys(by).forEach((key) => {
      switch (key) {
        case 'allIds':
          state.allIds.splice(0, state.allIds.length);
          break;
        case 'byIds':
          Object.keys(state.byIds).forEach((k) => delete state.byIds[k]);
          break;
        case 'cursor':
          state.cursor = null;
          break;
        case 'selectedIds':
          state.selectedIds.clear();
          break;
        default:
          break;
      }
    });
  }

  static removeNodes(state: TreeState, start: number, deleteCount: number) {
    const removed = state.allIds.splice(start, deleteCount);

    // remove nodes from byIds
    removed.forEach((r) => {
      delete state.byIds[r];
      // remove potential selected
      state.selectedIds.delete(r);
    });
  }

  static findNodeIndexById(
    state: TreeState,
    id: TreeNode['id'],
    from: number,
    to = state.allIds.length
  ) {
    // unsafe
    let lastChildIndex = 0;
    for (let i = from; i < to; i += 1) {
      if (state.allIds[i] === id) {
        lastChildIndex = i;
        break;
      }
    }
    return lastChildIndex;
  }
}
