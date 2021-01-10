import { createReducer } from '@reduxjs/toolkit';
import { TreeState } from './tree-state.interface';
import {
  changeSelectionFromTo,
  findDeepestOpenedChildId,
  updateCursorPosition,
} from './tree-state.utils';
import {
  closeDirectoryAction,
  lassoSelectionAction,
  openDirectoryAction,
  resetSelectionAction,
  selectFromToAction,
  setCursoredAction,
  toggleNodeHighlight,
  toggleSelectionAction,
} from './tree-state.actions';

export const treeStateReducer = createReducer<TreeState>(
  {
    byIds: {},
    allIds: [],
    cursor: null,
    selectedIds: new Set(),
  },
  (builder) => {
    builder.addCase(
      openDirectoryAction,
      (state, { payload: { parentIndex, nodes } }) => {
        // find parentId
        const parentId = state.allIds[parentIndex];
        const parent = state.byIds[parentId];
        parent.isOpened = true;

        const nestLevel = parent.nestLevel + 1;

        const ids: string[] = [];

        // insert nodes
        nodes.forEach((node) => {
          ids.push(node.id);
          state.byIds[node.id] = {
            id: node.id,
            name: node.name,
            children: [],
            isCursored: false,
            isOpened: false,
            isSelected: false,
            isHighlighted: false,
            nestLevel,
            type: node.type,
          };
        });

        // add children to parent.children node
        parent.children = ids;
        updateCursorPosition(state, () => {
          state.allIds.splice(parentIndex + 1, 0, ...ids);
        });
      }
    );

    builder.addCase(closeDirectoryAction, (state, { payload: { index } }) => {
      // find deepest opened item
      const parentId = state.allIds[index];
      const parent = state.byIds[parentId];
      const lastChildId = findDeepestOpenedChildId(state, parentId);
      parent.isOpened = false;
      if (parentId === lastChildId) {
        // parent dir is empty
        // just flip isOpened
        return;
      }

      // splice allIds array from start to this node
      let lastChildIndex: number;
      // find lastChild index in allIds array
      for (let i = index; i < state.allIds.length; i += 1) {
        if (state.allIds[i] === lastChildId) {
          lastChildIndex = i;
          break;
        }
      }

      updateCursorPosition(state, () => {
        const removed = state.allIds.splice(index + 1, lastChildIndex! - index);

        // remove nodes from byIds
        removed.forEach((r) => {
          delete state.byIds[r];
          // remove potential selected
          state.selectedIds.delete(r);
        });
      });
    });

    builder.addCase(setCursoredAction, (state, { payload: { index } }) => {
      const newCursorId = state.allIds[index];
      const newCursor = state.byIds[newCursorId];

      if (state.cursor === index) {
        // do nothing
        return;
      }

      if (state.cursor !== null) {
        // unset current cursor
        const currentCursor = state.byIds[state.allIds[state.cursor]];
        if (currentCursor) {
          currentCursor.isCursored = false;
        }
      }
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
      if (!state.cursor || index === state.cursor) {
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
      state.selectedIds.forEach((id) => {
        state.byIds[id].isSelected = false;
      });
      state.selectedIds.clear();
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
            changeSelectionFromTo({
              state,
              isSelect: false,
              start: end + 1,
              fwd: true,
            });
            changeSelectionFromTo({
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
          changeSelectionFromTo({
            state,
            isSelect: false,
            start: isGoingDown ? end + 1 : end - 1,
            fwd: isGoingDown,
          });
        } else {
          // not there
          // go from the end and towards the start and add
          changeSelectionFromTo({
            state,
            isSelect: true,
            start: end,
            end: start,
            fwd: !isGoingDown,
          });
          // check start - 1 position
          // in case we abruptly went from negative to positive selection
          changeSelectionFromTo({
            state,
            isSelect: false,
            start: isGoingDown ? start - 1 : start + 1,
            fwd: !isGoingDown,
          });
        }
      }
    );

    builder.addCase(toggleNodeHighlight, (state, { payload: { index } }) => {
      const nodeId = state.allIds[index];
      const node = state.byIds[nodeId];
      node.isHighlighted = !node.isHighlighted;
    });
  }
);
