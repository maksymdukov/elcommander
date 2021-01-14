import { ViewsState } from './tree-state.interface';

export const initialState: ViewsState = {
  views: [
    {
      viewName: 'LocalFS',
      viewId: '1',
      byPath: {},
      allPath: [],
      cursor: null,
      enterStack: [],
      selectedPaths: new Set(),
      startPath: '/',
      startPathLoading: false,
      startPathError: null,
    },
    {
      viewName: 'GoogleDriveFS',
      viewId: '2',
      byPath: {},
      allPath: [],
      cursor: null,
      enterStack: [],
      selectedPaths: new Set(),
      startPath: '/',
      startPathLoading: false,
      startPathError: null,
    },
  ],
};
