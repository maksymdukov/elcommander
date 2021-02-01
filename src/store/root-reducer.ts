import { combineReducers } from 'redux';
import { viewsSlice } from './features/views/views.slice';
import { bookmarksSlice } from './features/bookmarks/bookmarks.slice';
import { preferencesSlice } from './features/preferences/preferences.slice';

export const rootReducer = combineReducers({
  views: viewsSlice.reducer,
  bookmarks: bookmarksSlice.reducer,
  preferences: preferencesSlice.reducer,
});
