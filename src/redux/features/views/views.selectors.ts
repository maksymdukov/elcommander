import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../root-types';

export const getRootViewsSelector = (state: RootState) => state.views;
export const getViewsSelector = createSelector(
  getRootViewsSelector,
  (state) => state.views
);
export const getViewIds = createSelector(getRootViewsSelector, (state) =>
  state.views.map((v) => v.viewId)
);
export const getViewNames = createSelector(getRootViewsSelector, (state) =>
  state.views.map((v) => v.viewName)
);
export const getViewByIndex = createSelector(
  getViewsSelector,
  (_: RootState, index: number) => index,
  (state, index) => state[index]
);

export const getViewName = createSelector(
  getViewByIndex,
  (state) => state.viewName
);

export const getViewId = createSelector(
  getViewByIndex,
  (state) => state.viewId
);

export const getAllPathByIndex = createSelector(
  getViewByIndex,
  (state) => state.allIds
);

export const getNodeHash = createSelector(
  getViewByIndex,
  (state) => state.byId
);

export const getNodeById = createSelector(
  [getNodeHash, (_state, _idx, nodePath: string) => nodePath],
  (state, nodeId: string) => state[nodeId]
);

export const getNodeByIdx = createSelector(
  [getViewByIndex, (_state, _viewIndex, nodeIndex) => nodeIndex],
  (treeState, nodeIndex) => {
    const nodePath = treeState.allIds[nodeIndex];
    return treeState.byId[nodePath];
  }
);

export const getEnterStack = createSelector(
  getViewByIndex,
  (state) => state.enterStack
);

export const getCursorIdx = createSelector(
  getViewByIndex,
  (state) => state.cursor
);

export const getCursorNode = createSelector(
  getCursorIdx,
  getViewByIndex,
  (cursor, treeState) => {
    if (cursor === null) {
      return null;
    }
    const cursorPath = treeState.allIds[cursor];
    return treeState.byId[cursorPath];
  }
);

export const getSelectedPaths = createSelector(
  getViewByIndex,
  (state) => state.selectedIds
);

export const getStartPath = createSelector(
  getViewByIndex,
  (state) => state.startPath
);

export const getIsLoadingStartPath = createSelector(
  getViewByIndex,
  (state) => state.startPathLoading
);
