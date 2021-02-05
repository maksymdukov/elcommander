import { createReducer } from '@reduxjs/toolkit';
import { TreeNode } from 'elcommander-plugin-sdk';
import { TreeState } from './tree-state.interface';
import {
  closeDirectoryAction,
  enterDirectorySuccessAction,
  openDirectorySuccessAction,
  enterDirectoryStartAction,
  enterDirectoryFailAction,
  exitDirectoryAction,
  resetEnterStackAction,
  openDirectoryStartAction,
  openDirectoryFailAction,
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
      openDirectoryStartAction,
      (state, { payload: { index } }) => {
        const node = TreeStateUtils.getNodeByIndex(state, index);
        node.error = null;
        node.isLoading = true;
        node.isOpened = true;
      }
    );
    builder.addCase(
      openDirectorySuccessAction,
      (state, { payload: { parentIndex, nodes } }) => {
        // find parent
        const parent = TreeStateUtils.getNodeByIndex(state, parentIndex);
        parent.isOpened = true;
        parent.error = null;
        parent.isLoading = false;
        const nestLevel = parent.nestLevel + 1;
        const paths = DirectoryStateUtils.insertNodes({
          state,
          nestLevel,
          nodes: nodes.slice(1),
          parentId: parent.id,
        });
        // add children to parent.children node
        parent.children = paths;
        // update cursor pos due to possible shift in allPath
        CursorStateUtils.updateCursorPosition(state, () => {
          state.allIds.splice(parentIndex + 1, 0, ...paths);
        });
      }
    );
    builder.addCase(
      openDirectoryFailAction,
      (state, { payload: { error, index } }) => {
        const node = TreeStateUtils.getNodeByIndex(state, index);
        node.error = error;
        node.isLoading = false;
      }
    );

    builder.addCase(closeDirectoryAction, (state, { payload: { index } }) => {
      // find deepest opened item
      const parentId = state.allIds[index];
      const parent = state.byId[parentId];
      const lastChildId = CursorStateUtils.findDeepestOpenedChildPath(
        state,
        parentId
      );
      parent.isOpened = false;
      parent.isLoading = false;
      parent.error = null;
      if (parentId === lastChildId) {
        // parent dir is empty
        // just flip isOpened
        return;
      }

      // splice allPath array from start to this node
      // find lastChild index in allPath array
      const lastChildIndex = TreeStateUtils.findNodeIndexById(
        state,
        lastChildId,
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
      const candidatePath = state.allIds[index];
      const isSelected = state.selectedIds.has(candidatePath);
      if (isSelected) {
        state.selectedIds.delete(candidatePath);
      } else {
        state.selectedIds.add(candidatePath);
      }
      state.byId[candidatePath].isSelected = !isSelected;
    });

    builder.addCase(selectFromToAction, (state, { payload: { index } }) => {
      if (state.cursor === null || index === state.cursor) {
        return;
      }
      const isGoingDown = index > state.cursor;
      let i = state.cursor;

      while ((isGoingDown && i <= index) || (!isGoingDown && i >= index)) {
        const path = state.allIds[i];
        const node = state.byId[path];
        node.isSelected = true;
        state.selectedIds.add(node.id);
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
          const nodePath = state.allIds[end];
          if (!state.selectedIds.has(nodePath)) {
            // just add;
            state.selectedIds.add(nodePath);
            state.byId[nodePath].isSelected = true;
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
        const endPath = state.allIds[end];

        if (state.selectedIds.has(endPath)) {
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
      (state, { payload: { id, startNode } }) => {
        let nodeToEnter: TreeNode | undefined;
        // entering dir out of some list of nodes
        if (id) {
          nodeToEnter = TreeStateUtils.getNodeById(state, id);
          if (nodeToEnter) {
            state.enterStack.push(nodeToEnter);
            state.startNode = { ...nodeToEnter, children: [] };
          }
        } else if (startNode) {
          // TODO if we are setting new startNode while state.startPathLoading is true
          // reset all meta in startNode
          state.startNode = {
            ...startNode,
            children: [],
          };
          // TODO handle case where we enter path manually
        }
        DirectoryStateUtils.resetTreeState(state);
        state.startPathLoading = true;
        state.startPathError = null;
      }
    );

    builder.addCase(
      enterDirectorySuccessAction,
      (state, { payload: { nodes, cursorPath } }) => {
        let cursorIndex = 0;
        DirectoryStateUtils.enterDirByPath(state, nodes);
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
