import { createReducer } from '@reduxjs/toolkit';
import { TreeState } from './tree-state.interface';
import {
  closeDirectoryAction,
  enterDirectorySuccessAction,
  openDirectoryAction,
  enterDirectoryStartAction,
  enterDirectoryFailAction,
  exitDirectoryAction,
  resetEnterStackAction,
} from './actions/tree-dir.actions';
import { setCursoredAction } from './actions/tree-cursor.action';
import {
  lassoSelectionAction,
  resetSelectionAction,
  selectFromToAction,
  toggleNodeHighlightAction,
  toggleSelectionAction,
} from './actions/tree-selection.actions';
import { initialState } from './views-init-state';
import { DirectoryStateUtils } from './utils/directory-state.utils';
import { CursorStateUtils } from './utils/cursor-state.utils';
import { TreeStateUtils } from './utils/tree-state.utils';
import { SelectionStateUtils } from './utils/selection-state.utils';

export const treeStateReducer = createReducer<TreeState>(
  initialState.views[0],
  (builder) => {
    builder.addCase(
      openDirectoryAction,
      (state, { payload: { parentIndex, nodes } }) => {
        // find parent
        const parent = TreeStateUtils.getNodeByIndex(state, parentIndex);
        parent.isOpened = true;
        const nestLevel = parent.nestLevel + 1;
        const paths = DirectoryStateUtils.insertNodes({
          state,
          nestLevel,
          nodes,
          parentPath: parent.path,
        });
        // add children to parent.children node
        parent.children = paths;
        // update cursor pos due to possible shift in allPath
        CursorStateUtils.updateCursorPosition(state, () => {
          state.allPath.splice(parentIndex + 1, 0, ...paths);
        });
      }
    );

    builder.addCase(closeDirectoryAction, (state, { payload: { index } }) => {
      // find deepest opened item
      const parentPath = state.allPath[index];
      const parent = state.byPath[parentPath];
      const lastChildPath = CursorStateUtils.findDeepestOpenedChildPath(
        state,
        parentPath
      );
      parent.isOpened = false;
      if (parentPath === lastChildPath) {
        // parent dir is empty
        // just flip isOpened
        return;
      }

      // splice allPath array from start to this node
      // find lastChild index in allPath array
      const lastChildIndex = TreeStateUtils.findNodeIndexByPath(
        state,
        lastChildPath,
        index
      );

      CursorStateUtils.updateCursorPosition(state, () => {
        TreeStateUtils.removeNodes(state, index + 1, lastChildIndex! - index);
      });
    });

    builder.addCase(setCursoredAction, (state, { payload: { index } }) => {
      const newCursor = TreeStateUtils.getNodeByIndex(state, index);
      if (state.cursor === index) {
        // do nothing
        return;
      }

      // in cursor is set - unset current cursor
      CursorStateUtils.tryUnsetCurrentCursor(state);

      newCursor.isCursored = true;
      state.cursor = index;
    });

    builder.addCase(toggleSelectionAction, (state, { payload: { index } }) => {
      const candidatePath = state.allPath[index];
      const isSelected = state.selectedPaths.has(candidatePath);
      if (isSelected) {
        state.selectedPaths.delete(candidatePath);
      } else {
        state.selectedPaths.add(candidatePath);
      }
      state.byPath[candidatePath].isSelected = !isSelected;
    });

    builder.addCase(selectFromToAction, (state, { payload: { index } }) => {
      if (state.cursor === null || index === state.cursor) {
        return;
      }
      const isGoingDown = index > state.cursor;
      let i = state.cursor;

      while ((isGoingDown && i <= index) || (!isGoingDown && i >= index)) {
        const path = state.allPath[i];
        const node = state.byPath[path];
        node.isSelected = true;
        state.selectedPaths.add(node.path);
        i = isGoingDown ? i + 1 : i - 1;
      }
    });

    builder.addCase(resetSelectionAction, (state) => {
      SelectionStateUtils.resetSelection(state);
    });

    builder.addCase(
      lassoSelectionAction,
      (state, { payload: { start, end } }) => {
        if (start === end) {
          // one node selection case
          const nodePath = state.allPath[end];
          if (!state.selectedPaths.has(nodePath)) {
            // just add;
            state.selectedPaths.add(nodePath);
            state.byPath[nodePath].isSelected = true;
          } else {
            // do nothing but check that no one else is added at the position of end + 1 and end - 1
            // check to see two sides
            SelectionStateUtils.changeSelectionFromTo({
              state,
              isSelect: false,
              start: end + 1,
              fwd: true,
            });
            SelectionStateUtils.changeSelectionFromTo({
              state,
              isSelect: false,
              start: end - 1,
              fwd: false,
            });
          }
          return;
        }

        const isGoingDown = start < end;
        const endPath = state.allPath[end];

        if (state.selectedPaths.has(endPath)) {
          // it's already there
          // lets remove potential end + 1
          SelectionStateUtils.changeSelectionFromTo({
            state,
            isSelect: false,
            start: isGoingDown ? end + 1 : end - 1,
            fwd: isGoingDown,
          });
        } else {
          // not there
          // go from the end and towards the start and add
          SelectionStateUtils.changeSelectionFromTo({
            state,
            isSelect: true,
            start: end,
            end: start,
            fwd: !isGoingDown,
          });
          // check start - 1 position
          // in case we abruptly went from negative to positive selection
          SelectionStateUtils.changeSelectionFromTo({
            state,
            isSelect: false,
            start: isGoingDown ? start - 1 : start + 1,
            fwd: !isGoingDown,
          });
        }
      }
    );

    builder.addCase(
      toggleNodeHighlightAction,
      (state, { payload: { index } }) => {
        const node = TreeStateUtils.getNodeByIndex(state, index);
        node.isHighlighted = !node.isHighlighted;
      }
    );

    builder.addCase(exitDirectoryAction, (state) => {
      state.enterStack.pop();
    });
    builder.addCase(resetEnterStackAction, (state) => {
      state.enterStack.splice(0, state.enterStack.length);
    });

    builder.addCase(
      enterDirectoryStartAction,
      (state, { payload: { path } }) => {
        if (path) {
          const nodeToEnter = TreeStateUtils.getNodeByPath(state, path);
          if (nodeToEnter) {
            state.enterStack.push(nodeToEnter);
          }
        }
        DirectoryStateUtils.resetTreeState(state);
        state.startPathLoading = true;
      }
    );

    builder.addCase(
      enterDirectorySuccessAction,
      (state, { payload: { path, nodes, cursorPath } }) => {
        let cursorIndex = 0;
        DirectoryStateUtils.enterDirByPath(state, nodes, path);
        // user goes one directory up
        // lets restore cursor
        if (cursorPath) {
          cursorIndex = CursorStateUtils.findCursorIndex(state, cursorPath);
        }
        CursorStateUtils.trySetCursorAt(state, cursorIndex);
      }
    );

    builder.addCase(
      enterDirectoryFailAction,
      (state, { payload: { error } }) => {
        state.startPathLoading = false;
        state.startPathError = error;
      }
    );
  }
);
