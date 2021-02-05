import { TreeNode } from 'elcommander-plugin-sdk';
import { TreeState } from '../tree-state.interface';

export class TreeStateUtils {
  static getNodeById(
    state: TreeState,
    id: TreeNode['id']
  ): TreeNode | undefined {
    return state.byId[id];
  }

  static getNodeByIndex(state: TreeState, index: number) {
    return state.byId[state.allIds[index]];
  }

  static resetTreeStateBy(
    state: TreeState,
    by: { [K in keyof TreeState]?: true }
  ) {
    Object.keys(by).forEach((key) => {
      const objKey = key as keyof TreeState;
      switch (objKey) {
        case 'allIds':
          state.allIds = [];
          break;
        case 'byId':
          state.byId = {};
          break;
        case 'cursor':
          state.cursor = null;
          break;
        case 'selectedIds':
          state.selectedIds.clear();
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
    const removed = state.allIds.splice(start, deleteCount);

    // remove nodes from byId
    removed.forEach((id) => {
      const parentId = state.byId[id].parent;
      if (parentId) {
        const parent = state.byId[parentId];
        if (parent) parent.children = [];
      }
      delete state.byId[id];
      // remove potential selected
      state.selectedIds.delete(id);
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
