import { createSlice } from '@reduxjs/toolkit';
import { bookmarksInitState } from './bookmarks-init-state';
import { AddBookmarkAction, RemoveBookmarkAction } from './bookmarks.actions';

// from view - classId, configName
// from node - id, name, meta, path

export const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState: bookmarksInitState,
  reducers: {
    addBookmark(state, { payload: { bookmark } }: AddBookmarkAction) {
      state.push(bookmark);
    },
    removeBookmark(state, { payload: { idx } }: RemoveBookmarkAction) {
      state.splice(idx, 1);
    },
  },
});

export const {
  addBookmark: addBookmarkAction,
  removeBookmark: removeBookmarkAction,
} = bookmarksSlice.actions;
