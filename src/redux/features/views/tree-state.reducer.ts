import { createReducer } from '@reduxjs/toolkit';
import { TreeState } from './tree-state.interface';
import {
  closeDirectoryAction,
  enterDirectoryAction,
  enterDirectoryByPathAction,
  exitDirectoryAction,
  openDirectoryAction,
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
import { TreeStateUtils } from './tree-state.utils';
import { SelectionStateUtils } from './utils/selection-state.utils';

export const treeStateReducer = createReducer<TreeState>(
  initialState.views[0],
  (builder) => {
    builder.addCase(
      openDirectoryAction,
      (state, { payload: { parentIndex, nodes } }) => {
        // find parentId
        const parent = TreeStateUtils.getNodeByIndex(state, parentIndex);
        parent.isOpened = true;
        const nestLevel = parent.nestLevel + 1;
        const ids = DirectoryStateUtils.insertNodes({
          state,
          nestLevel,
          nodes,
          parentId: parent.id,
        });
        // add children to parent.children node
        parent.children = ids;
        // update cursor pos due to possible shift in allIds
        CursorStateUtils.updateCursorPosition(state, () => {
          state.allIds.splice(parentIndex + 1, 0, ...ids);
        });
      }
    );

    builder.addCase(closeDirectoryAction, (state, { payload: { index } }) => {
      // find deepest opened item
      const parentId = state.allIds[index];
      const parent = state.byIds[parentId];
      const lastChildId = CursorStateUtils.findDeepestOpenedChildId(
        state,
        parentId
      );
      parent.isOpened = false;
      if (parentId === lastChildId) {
        // parent dir is empty
        // just flip isOpened
        return;
      }

      // splice allIds array from start to this node
      // find lastChild index in allIds array
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
      const candidateId = state.allIds[index];
      const isSelected = state.selectedIds.has(candidateId);
      if (isSelected) {
        state.selectedIds.delete(candidateId);
      } else {
        state.selectedIds.add(candidateId);
      }
      state.byIds[candidateId].isSelected = !isSelected;
    });

    builder.addCase(selectFromToAction, (state, { payload: { index } }) => {
      if (state.cursor === null || index === state.cursor) {
        return;
      }
      const isGoingDown = index > state.cursor;
      let i = state.cursor;

      while ((isGoingDown && i <= index) || (!isGoingDown && i >= index)) {
        const id = state.allIds[i];
        const node = state.byIds[id];
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
          const nodeId = state.allIds[end];
          if (!state.selectedIds.has(nodeId)) {
            // just add;
            state.selectedIds.add(nodeId);
            state.byIds[nodeId].isSelected = true;
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
        const endId = state.allIds[end];

        if (state.selectedIds.has(endId)) {
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
        const nodeId = state.allIds[index];
        const node = state.byIds[nodeId];
        node.isHighlighted = !node.isHighlighted;
      }
    );

    builder.addCase(
      enterDirectoryAction,
      (state, { payload: { index, nodes } }) => {
        const targetNode = TreeStateUtils.getNodeByIndex(state, index);
        DirectoryStateUtils.enterDirByPath(state, nodes, targetNode.id);
        CursorStateUtils.trySetCursorAt(state);
      }
    );

    builder.addCase(
      enterDirectoryByPathAction,
      (state, { payload: { nodes, path } }) => {
        DirectoryStateUtils.enterDirByPath(state, nodes, path);
        CursorStateUtils.trySetCursorAt(state);
      }
    );

    builder.addCase(
      exitDirectoryAction,
      (state, { payload: { nodes, parentPath } }) => {
        const currentPath = state.startPath;
        DirectoryStateUtils.enterDirByPath(state, nodes, parentPath);
        const cursorIndex = CursorStateUtils.findCursorIndex(
          state,
          currentPath
        );
        // try to set cursor on the exited dir
        CursorStateUtils.trySetCursorAt(state, cursorIndex);
      }
    );
  }
);
