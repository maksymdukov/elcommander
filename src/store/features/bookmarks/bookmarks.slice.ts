import { createSlice } from '@reduxjs/toolkit';
import { bookmarksInitState } from './bookmarks-init-state';
import { AddBookmarkAction } from './bookmarks.actions';

// from view - classId, configName
// from node - id, name, meta, path

export const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState: bookmarksInitState,
  reducers: {
    addBookmark(state, { payload: { bookmark } }: AddBookmarkAction) {
      state.push(bookmark);
    },
  },
});

export const { addBookmark: addBookmarkAction } = bookmarksSlice.actions;
