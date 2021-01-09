import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { treeStateReducer } from './tree-state.reducer';
import { ViewsState } from './tree-state.interface';
import { FsItemTypeEnum } from '../../../enums/fs-item-type.enum';

export const initialState: ViewsState = {
  views: [
    {
      byIds: {
        '/': {
          type: FsItemTypeEnum.Directory,
          children: [],
          nestLevel: 0,
          isSelected: false,
          isOpened: false,
          isCursored: false,
          id: '/',
          name: '/',
        },
      },
      allIds: ['/'],
      cursor: null,
      selectedIds: new Set(),
      lassoActive: false,
      lassoCoords: {
        current: null,
        start: null,
        mousePageY: 0,
      },
      lassoScrolling: false,
      lassoStartCandidate: null,
    },
    {
      byIds: {
        '/': {
          type: FsItemTypeEnum.Directory,
          children: [],
          nestLevel: 0,
          isSelected: false,
          isOpened: false,
          isCursored: false,
          id: '/',
          name: '/',
        },
      },
      allIds: ['/'],
      cursor: null,
      selectedIds: new Set(),
      lassoActive: false,
      lassoCoords: {
        current: null,
        start: null,
        mousePageY: 0,
      },
      lassoScrolling: false,
      lassoStartCandidate: null,
    },
  ],
};

export interface ViewIndexPayload {
  viewIndex: number;
}

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
        byIds: {},
        allIds: [],
        cursor: null,
        selectedIds: new Set(),
        lassoActive: false,
        lassoCoords: {
          current: null,
          start: null,
          mousePageY: 0,
        },
        lassoScrolling: false,
        lassoStartCandidate: null,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isTreeStateAction, (state, action) => {
      treeStateReducer(state.views[action.payload.viewIndex], action);
    });
  },
});
