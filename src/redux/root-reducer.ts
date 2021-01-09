import { combineReducers } from 'redux';
import { viewsSlice } from './features/views/views.slice';

export const rootReducer = combineReducers({
  views: viewsSlice.reducer,
});
