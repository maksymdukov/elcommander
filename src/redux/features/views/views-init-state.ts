import { ViewsState } from './tree-state.interface';

export const initialState: ViewsState = {
  views: [
    {
      viewName: 'LocalFS',
      viewId: '1',
      byIds: {},
      allIds: [],
      cursor: null,
      selectedIds: new Set(),
      startPath: '/',
    },
    {
      viewName: 'LocalFS',
      viewId: '2',
      byIds: {},
      allIds: [],
      cursor: null,
      selectedIds: new Set(),
      startPath: '/',
    },
  ],
};
