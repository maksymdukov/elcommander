import { TreeNode } from 'elcommander-plugin-sdk';
import { TreeState } from '../tree-state.interface';

export class CursorStateUtils {
  static trySetCursorAt(state: TreeState, position = 0) {
    if (position < 0) return;
    // if current dir is not empty
    if (state.allIds.length) {
      state.cursor = position;
      const id = state.allIds[position];
      state.byId[id].isCursored = true;
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
      state.cursor = state.allIds.findIndex((path) => path === oldCursorId);
    }
  }

  /*
  returns either parentId if dir is empty or a found childId
*/
  static findDeepestOpenedChildPath(
    state: TreeState,
    parentId: string
  ): string {
    const parent = state.byId[parentId];

    // empty dir
    if (!parent.children.length) {
      return parentId;
    }

    // last child is closed dir
    const lastChildId = parent.children[parent.children.length - 1];
    if (!state.byId[lastChildId].isOpened) {
      return lastChildId;
    }

    return this.findDeepestOpenedChildPath(state, lastChildId);
  }

  static unsetCursorByIndex(state: TreeState, index: number) {
    const currentCursor = state.byId[state.allIds[index]];
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

  static findCursorIndex(state: TreeState, cursorPath: TreeNode['path']) {
    const cursor = Object.values(state.byId).find(
      (node) => node.path === cursorPath
    );
    if (!cursor) {
      return -1;
    }
    return state.allIds.indexOf(cursor.id);
  }
}
