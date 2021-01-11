import { TreeState } from '../tree-state.interface';
import { TreeNode } from '../../../../interfaces/node.interface';

export class CursorStateUtils {
  static trySetCursorAt(state: TreeState, position = 0) {
    if (position < 0) return;
    // if current dir is not empty
    if (state.allIds.length) {
      state.cursor = position;
      const id = state.allIds[position];
      state.byIds[id].isCursored = true;
    }
  }

  static updateCursorPosition(state: TreeState, cb: () => void) {
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
  }

  /*
  returns either parentId if dir is empty or a found childId
*/
  static findDeepestOpenedChildId(state: TreeState, parentId: string): string {
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

    return this.findDeepestOpenedChildId(state, lastChildId);
  }

  static unsetCursorByIndex(state: TreeState, index: number) {
    const currentCursor = state.byIds[state.allIds[index]];
    if (currentCursor) {
      currentCursor.isCursored = false;
    }
    state.cursor = null;
  }

  static tryUnsetCurrentCursor(state: TreeState) {
    if (state.cursor !== null) {
      this.unsetCursorByIndex(state, state.cursor);
    }
  }

  static findCursorIndex(state: TreeState, cursorId: TreeNode['id']) {
    return state.allIds.indexOf(cursorId);
  }
}
