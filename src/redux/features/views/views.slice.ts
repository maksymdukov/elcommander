import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { treeStateReducer } from './tree-state.reducer';
import { initialState } from './views-init-state';
import { ViewIndexPayload } from './tree-state.interface';

function isTreeStateAction(
  action: AnyAction
): action is PayloadAction<ViewIndexPayload> {
  return action.payload && action.payload.viewIndex !== undefined;
}

export const viewsSlice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    addView(state) {
      state.views.push({
        viewName: 'boo',
        viewId: state.views.length ? state.views.length.toString() : '0',
        byPath: {},
        allPath: [],
        cursor: null,
        selectedPaths: new Set(),
        startPath: '/',
        startPathLoading: false,
        startPathError: null,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isTreeStateAction, (state, action) => {
      treeStateReducer(state.views[action.payload.viewIndex], action);
    });
  },
});
