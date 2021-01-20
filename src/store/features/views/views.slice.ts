import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { treeStateReducer } from './tree-state.reducer';
import { initialState } from './views-init-state';
import { ViewIndexPayload } from './tree-state.interface';
import { FsItemTypeEnum } from '../../../enums/fs-item-type.enum';
import { ViewsStateUtils } from './utils/views-state.utils';
import { AddViewAction, RemoveViewAction } from './actions/views.actions';

function isTreeStateAction(
  action: AnyAction
): action is PayloadAction<ViewIndexPayload> {
  return action.payload && action.payload.viewIndex !== undefined;
}

export const viewsSlice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    addView(state, { payload: { backend, config } }: AddViewAction) {
      state.views.push({
        classId: backend.id,
        viewId: ViewsStateUtils.generateUUID(state),
        configName: config?.name || '',
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
        },
        startPathLoading: false,
        startPathError: null,
        enterStack: [],
      });
    },
    removeView(state, { payload: { viewIndex } }: RemoveViewAction) {
      state.views.splice(viewIndex, 1);
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
} = viewsSlice.actions;
