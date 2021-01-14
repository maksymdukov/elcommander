import { ViewsState } from './tree-state.interface';

export const initialState: ViewsState = {
  views: [
    {
      viewName: 'LocalFS',
      viewId: '1',
      byId: {},
      allIds: [],
      cursor: null,
      enterStack: [],
      selectedIds: new Set(),
      startPath: '/',
      startPathLoading: false,
      startPathError: null,
    },
    {
      viewName: 'GoogleDriveFS',
      viewId: '2',
      byId: {},
      allIds: [],
      cursor: null,
      enterStack: [],
      selectedIds: new Set(),
      startPath: '/',
      startPathLoading: false,
      startPathError: null,
    },
  ],
};
