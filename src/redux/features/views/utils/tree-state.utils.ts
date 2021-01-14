import { TreeState } from '../tree-state.interface';
import { TreeNode } from '../../../../interfaces/node.interface';

export class TreeStateUtils {
  static getNodeByPath(
    state: TreeState,
    path: TreeNode['path']
  ): TreeNode | undefined {
    return state.byPath[path];
  }

  static getNodeByIndex(state: TreeState, index: number) {
    return state.byPath[state.allPath[index]];
  }

  static resetTreeStateBy(
    state: TreeState,
    by: { [K in keyof TreeState]?: true }
  ) {
    Object.keys(by).forEach((key) => {
      const objKey = key as keyof TreeState;
      switch (objKey) {
        case 'allPath':
          state.allPath.splice(0, state.allPath.length);
          break;
        case 'byPath':
          Object.keys(state.byPath).forEach((k) => delete state.byPath[k]);
          break;
        case 'cursor':
          state.cursor = null;
          break;
        case 'selectedPaths':
          state.selectedPaths.clear();
          break;
        case 'startPathLoading':
          state.startPathLoading = false;
          break;
        case 'startPathError':
          state.startPathError = null;
          break;
        default:
          break;
      }
    });
  }

  static removeNodes(state: TreeState, start: number, deleteCount: number) {
    const removed = state.allPath.splice(start, deleteCount);

    // remove nodes from byPath
    removed.forEach((path) => {
      delete state.byPath[path];
      // remove potential selected
      state.selectedPaths.delete(path);
    });
  }

  static findNodeIndexByPath(
    state: TreeState,
    path: TreeNode['path'],
    from: number,
    to = state.allPath.length
  ) {
    // unsafe
    let lastChildIndex = 0;
    for (let i = from; i < to; i += 1) {
      if (state.allPath[i] === path) {
        lastChildIndex = i;
        break;
      }
    }
    return lastChildIndex;
  }
}
