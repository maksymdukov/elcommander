import { TreeState } from '../tree-state.interface';
import { TreeNode } from '../../../../interfaces/node.interface';

export class CursorStateUtils {
  static trySetCursorAt(state: TreeState, position = 0) {
    if (position < 0) return;
    // if current dir is not empty
    if (state.allPath.length) {
      state.cursor = position;
      const path = state.allPath[position];
      state.byPath[path].isCursored = true;
    }
  }

  static updateCursorPosition(state: TreeState, cb: () => void) {
    // save old position
    let oldCursorPath: null | string = null;
    if (state.cursor !== null) {
      oldCursorPath = state.allPath[state.cursor];
    }
    cb();
    // update cursor position
    if (oldCursorPath) {
      state.cursor = state.allPath.findIndex((path) => path === oldCursorPath);
    }
  }

  /*
  returns either parentId if dir is empty or a found childId
*/
  static findDeepestOpenedChildPath(
    state: TreeState,
    parentPath: string
  ): string {
    const parent = state.byPath[parentPath];

    // empty dir
    if (!parent.children.length) {
      return parentPath;
    }

    // last child is closed dir
    const lastChildPath = parent.children[parent.children.length - 1];
    if (!state.byPath[lastChildPath].isOpened) {
      return lastChildPath;
    }

    return this.findDeepestOpenedChildPath(state, lastChildPath);
  }

  static unsetCursorByIndex(state: TreeState, index: number) {
    const currentCursor = state.byPath[state.allPath[index]];
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

  static findCursorIndex(state: TreeState, cursorId: TreeNode['path']) {
    return state.allPath.indexOf(cursorId);
  }
}
