import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FsItemTypeEnum } from 'elcommander-plugin-sdk';
import { treeStateReducer } from './tree-state.reducer';
import { initialState } from './views-init-state';
import { ViewIndexPayload } from './tree-state.interface';
import { ViewsStateUtils } from './utils/views-state.utils';
import {
  AddViewAction,
  RemoveViewAction,
  ResizeViewAction,
  SetViewConfigNameAction,
} from './actions/views.actions';

function isTreeStateAction(
  action: AnyAction
): action is PayloadAction<ViewIndexPayload> {
  return action.payload && action.payload.viewIndex !== undefined;
}

export const viewsSlice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    addView(state, { payload: { backend, config, startNode } }: AddViewAction) {
      const viewsLength = state.views.length;
      const futureLength = viewsLength + 1;
      const avgWidth = 100 / futureLength;
      state.views.forEach((view) => {
        view.width -= view.width / futureLength;
      });
      state.views.push({
        classId: backend.id,
        // calculate width when adding view
        // split last tab in two
        width: avgWidth,
        viewId: ViewsStateUtils.generateUUID(state),
        viewName: backend.name,
        configName: config || '',
        byId: {},
        allIds: [],
        cursor: null,
        selectedIds: new Set(),
        startNode: {
          id: '/',
          name: 'root',
          type: FsItemTypeEnum.Directory,
          children: [],
          isLoading: false,
          isOpened: false,
          isCursored: false,
          isHighlighted: false,
          isSelected: false,
          error: null,
          path: '/',
          nestLevel: -1,
          meta: {},
          ...backend.klass.FS.getStartNode(),
          ...startNode,
        },
        startPathLoading: false,
        startPathError: null,
        enterStack: [],
      });
    },
    removeView(state, { payload: { viewIndex } }: RemoveViewAction) {
      const removedWidth = state.views[viewIndex].width;
      const newLength = state.views.length - 1;
      state.views.splice(viewIndex, 1);
      state.views.forEach((view) => {
        view.width += removedWidth / newLength;
      });
    },
    resizeView(
      state,
      { payload: { viewIndex, prevViewWidth, viewWidth } }: ResizeViewAction
    ) {
      state.views[viewIndex].width = viewWidth;
      // resize previous one
      state.views[viewIndex - 1].width = prevViewWidth;
    },
    setConfigName(
      state,
      { payload: { configName, viewIndex } }: SetViewConfigNameAction
    ) {
      state.views[viewIndex].configName = configName;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isTreeStateAction, (state, action) => {
      treeStateReducer(state.views[action.payload.viewIndex], action);
    });
  },
});

export const {
  addView: addViewAction,
  removeView: removeViewAction,
  resizeView: resizeViewAction,
} = viewsSlice.actions;

export const setConfigNameAction = viewsSlice.actions.setConfigName;
