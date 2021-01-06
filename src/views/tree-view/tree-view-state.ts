import { DirectoryNode } from '../../classes/dir-node';
import {
  markItemAsSelected,
  toggleDirectory,
  toggleItemAsCursor,
  toggleItemAsSelected,
} from './tree.utils';
import { ICursor } from '../../interfaces/cursor.interface';
import { Children } from '../../backends/interfaces/fs-backend.interface';
import { ISelected } from '../../interfaces/selected.interface';
import { TreeNode } from '../../classes/tree-node';

export interface TreeState {
  tree: DirectoryNode;
  cursor: ICursor | null;
  selected: ISelected[];
  lassoActive: boolean;
  selectedHash: Map<TreeNode, null>;
  lassoCoords: {
    start: number | null;
    current: number | null;
    mousePageY: number;
  };
  lassoScrolling: boolean;
  lassoStartCandidate: TreeNode | null;
}

interface ToggleDirectoryAction {
  type: 'TOGGLE_TREE_DIR';
  targetNode: DirectoryNode;
  children: Children;
}

interface MoveCursorAction {
  type: 'MOVE_CURSOR';
  targetNode: TreeNode;
}

interface ToggleItemSelectedAction {
  type: 'TOGGLE_ITEM_SELECTED';
  targetNode: TreeNode;
}

interface ResetSelectedItemsAction {
  type: 'RESET_SELECTED_ITEMS';
}

interface MarkItemsSelectedFromToAction {
  type: 'MARK_ITEMS_SELECTED_FROM_TO';
  from: TreeNode;
  to: TreeNode;
  fwd: boolean;
}

interface LassoSelectStartAction {
  type: 'LASSO_SELECT_START';
  startY: number;
  firstNodeCandidate: TreeNode;
}

interface LassoSelectFinishAction {
  type: 'LASSO_SELECT_FINISH';
  finishY: number;
}

interface LassoSelectMoveAction {
  type: 'LASSO_MOVE';
  currentY: number;
  scrolling: boolean;
}

interface LassoSelectItem {
  type: 'LASSO_SELECT_ITEM';
  foundNode: TreeNode;
  lassoDirection: boolean;
}

export type TreeActions =
  | ToggleDirectoryAction
  | MoveCursorAction
  | ToggleItemSelectedAction
  | ResetSelectedItemsAction
  | MarkItemsSelectedFromToAction
  | LassoSelectStartAction
  | LassoSelectMoveAction
  | LassoSelectFinishAction
  | LassoSelectItem;

export const toggleDirectoryAction = (
  targetNode: DirectoryNode,
  children: Children
): ToggleDirectoryAction => ({
  type: 'TOGGLE_TREE_DIR',
  children,
  targetNode,
});

export const moveCursorAction = (targetNode: TreeNode): MoveCursorAction => ({
  type: 'MOVE_CURSOR',
  targetNode,
});

export const toggleItemSelectedAction = (
  targetNode: TreeNode
): ToggleItemSelectedAction => ({
  type: 'TOGGLE_ITEM_SELECTED',
  targetNode,
});

export const resetSelectedItemsAction = (): ResetSelectedItemsAction => ({
  type: 'RESET_SELECTED_ITEMS',
});

export const markItemsSelectedFromTo = (
  from: TreeNode,
  to: TreeNode,
  fwd: boolean
): MarkItemsSelectedFromToAction => ({
  type: 'MARK_ITEMS_SELECTED_FROM_TO',
  from,
  to,
  fwd,
});

export const lassoSelectMoveAction = ({
  currentY,
  scrolling = false,
}: {
  currentY: number;
  scrolling?: boolean;
}): LassoSelectMoveAction => ({
  type: 'LASSO_MOVE',
  currentY,
  scrolling,
});

export const lassoSelectStartAction = (
  y: number,
  firstNodeCandidate: TreeNode
): LassoSelectStartAction => ({
  type: 'LASSO_SELECT_START',
  startY: y,
  firstNodeCandidate,
});

export const lassoSelectFinishAction = (
  y: number
): LassoSelectFinishAction => ({
  type: 'LASSO_SELECT_FINISH',
  finishY: y,
});

export const lassoSelectItem = (
  foundNode: TreeNode,
  lassoDirection: boolean
): LassoSelectItem => ({
  type: 'LASSO_SELECT_ITEM',
  foundNode,
  lassoDirection,
});

export const treeStateReducer = (
  state: TreeState,
  action: TreeActions
): TreeState => {
  switch (action.type) {
    case 'TOGGLE_TREE_DIR':
      let updatedTree = state.tree;
      let newCursor = state.cursor;
      let newSelected = state.selected;
      // closing dir
      if (action.targetNode.isOpened) {
        // if cursor is a child
        if (state.cursor?.node.isMyParent(action.targetNode)) {
          newCursor = { node: action.targetNode };
          updatedTree = toggleItemAsCursor(updatedTree, action.targetNode);
        }
        // if selected are children
        newSelected = state.selected.filter((selectedItem) => {
          if (selectedItem.node.isMyParent(action.targetNode)) {
            state.selectedHash.delete(selectedItem.node);
            toggleItemAsSelected(state.tree, selectedItem.node);
            return false;
          }
          return true;
        });
      }
      return {
        ...state,
        selected: newSelected,
        cursor: newCursor,
        tree: toggleDirectory(updatedTree, action.targetNode, action.children),
      };
    case 'MOVE_CURSOR':
      let newTree = state.tree;
      // unselect prev cursor
      if (state.cursor) {
        newTree = toggleItemAsCursor(newTree, state.cursor.node);
      }
      // select new cursor
      const tree = toggleItemAsCursor(newTree, action.targetNode);
      return {
        ...state,
        cursor: { node: action.targetNode },
        tree,
      };
    case 'TOGGLE_ITEM_SELECTED':
      const nState = { ...state };
      if (nState.selectedHash.has(action.targetNode)) {
        nState.selectedHash.delete(action.targetNode);
        nState.selected = nState.selected.filter(
          (selection) => selection.node !== action.targetNode
        );
      } else {
        nState.selectedHash.set(action.targetNode, null);
        nState.selected = [...nState.selected, { node: action.targetNode }];
      }
      nState.tree = toggleItemAsSelected(nState.tree, action.targetNode);
      return nState;
    case 'RESET_SELECTED_ITEMS':
      if (state.selected.length) {
        state.selected.forEach((selectedItem) => {
          toggleItemAsSelected(state.tree, selectedItem.node);
        });
      }
      state.selectedHash.clear();
      return {
        ...state,
        selected: [],
      };
    case 'MARK_ITEMS_SELECTED_FROM_TO':
      const nodesToSelect = action.from.getAdjacentOpenedFlatListTo(
        action.to,
        action.fwd
      );
      nodesToSelect.forEach((selectedItem) => {
        markItemAsSelected(state.tree, selectedItem.node);
        state.selectedHash.set(selectedItem.node, null);
      });
      const newSelectedHash = new Map();
      const updatedSelected = [...state.selected, ...nodesToSelect].filter(
        (item) => {
          if (newSelectedHash.has(item.node)) {
            return false;
          }
          newSelectedHash.set(item.node, null);
          return true;
        }
      );
      return {
        ...state,
        selected: updatedSelected,
      };
    case 'LASSO_SELECT_START':
      return {
        ...state,
        lassoScrolling: false,
        lassoActive: true,
        lassoStartCandidate: action.firstNodeCandidate,
        lassoCoords: {
          ...state.lassoCoords,
          start: action.startY,
          current: null,
        },
      };
    case 'LASSO_MOVE':
      return {
        ...state,
        lassoScrolling: action.scrolling,
        lassoCoords: {
          ...state.lassoCoords,
          current: action.currentY,
        },
      };
    case 'LASSO_SELECT_ITEM':
      // TODO
      // refactor to more granular actions and move logic into useEffect
      let newSelectedItems = [];
      const newState = { ...state };

      // edge case
      // first new node which is not the same as lassoStartCandidate
      // it means mousemove misfired the first node
      // add lassoStartCandidate to selection
      if (
        !state.selected.length &&
        state.lassoStartCandidate !== null &&
        action.foundNode !== state.lassoStartCandidate
      ) {
        toggleItemAsSelected(state.tree, state.lassoStartCandidate);
        newSelectedItems.push({ node: state.lassoStartCandidate });
        newState.selected = newSelectedItems;
        newState.selectedHash.set(state.lassoStartCandidate, null);
      }

      // first new node
      if (
        !newState.selectedHash.has(action.foundNode) &&
        !newState.selected.length
      ) {
        toggleItemAsSelected(state.tree, action.foundNode);
        newSelectedItems.push({ node: action.foundNode });
        newState.selected = newSelectedItems;
        state.selectedHash.set(action.foundNode, null);
        return newState;
      }

      // new node, not first
      if (
        !newState.selectedHash.has(action.foundNode) &&
        newState.selected.length
      ) {
        const addedSelections = [];
        let currentNode = action.foundNode;
        while (
          newState.selected[newState.selected.length - 1].node !== currentNode
        ) {
          // edge case
          // we've selected some element before in 'up' direction
          // no we swiftly change direction and our firstnode is above new action.foundNode
          // let's leave only first node, unselect old other nodes
          if (currentNode === newState.selected[0].node) {
            newState.selected.forEach((selection, idx) => {
              if (idx !== 0) {
                newState.selectedHash.delete(selection.node);
                toggleItemAsSelected(newState.tree, selection.node);
              }
            });
            newState.selected = [
              newState.selected[0],
              ...addedSelections.reverse(),
            ];
            return newState;
          }
          // edge case end

          toggleItemAsSelected(newState.tree, currentNode);
          newState.selectedHash.set(currentNode, null);
          addedSelections.push({ node: currentNode });
          const nextNode = currentNode.getChildToSelect(!action.lassoDirection);
          if (!nextNode) {
            console.error('Error lasso selecting nodes. Next node not found');
            break;
          }
          currentNode = nextNode;
        }
        newState.selected = [
          ...newState.selected,
          ...addedSelections.reverse(),
        ];
        return newState;
      }

      // already existing node and it's the last one
      // it means we are hovering over the last selected node
      // do nothing
      // can be done on the level higher as an optimization technique
      if (
        newState.selectedHash.has(action.foundNode) &&
        newState.selected[newState.selected.length - 1].node ===
          action.foundNode
      ) {
        return state;
      }

      // node exists and it's not the last one added
      // lets remove every node from the end or the array to this node
      if (
        newState.selectedHash.has(action.foundNode) &&
        newState.selected[newState.selected.length - 1].node !==
          action.foundNode
      ) {
        newSelectedItems = [...newState.selected];
        // i > 0 -> except for the first (starting) node
        for (let i = newState.selected.length - 1; i > 0; i--) {
          const currentNode = newState.selected[i].node;
          if (currentNode === action.foundNode) {
            break;
          }
          toggleItemAsSelected(newState.tree, currentNode);
          newState.selectedHash.delete(currentNode);
          newSelectedItems.pop();
        }
        newState.selected = newSelectedItems;
        return newState;
      }
      return state;
    case 'LASSO_SELECT_FINISH':
      return {
        ...state,
        lassoStartCandidate: null,
        lassoScrolling: false,
        lassoActive: false,
        lassoCoords: {
          ...state.lassoCoords,
          current: null,
        },
      };
    default:
      return state;
  }
};
