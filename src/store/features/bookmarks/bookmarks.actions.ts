import { PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from 'store/store';
import { TreeNode } from 'interfaces/node.interface';
import { getFSPluginsMap } from 'plugins/fs/backends-map';
import { IBookmark } from './bookmarks.interface';
import { getViewByIndex } from '../views/views.selectors';
import { addBookmarkAction } from './bookmarks.slice';
import { addViewAction } from '../views/views.slice';

export type AddBookmarkAction = PayloadAction<{
  bookmark: IBookmark;
}>;

export type RemoveBookmarkAction = PayloadAction<{
  idx: number;
}>;

export const addBookmarkThunk = (
  viewIndex: number,
  startNode: TreeNode
): AppThunk => async (dispatch, getState) => {
  const startView = getViewByIndex(getState(), viewIndex);
  const bookmark: IBookmark = {
    viewName: startView.viewName,
    classId: startView.classId,
    configName: startView.configName,
    startNode,
  };
  dispatch(addBookmarkAction({ bookmark }));
};

export const openBookmarkThunk = (bookmark: IBookmark): AppThunk => async (
  dispatch
) => {
  const fsPluginsMap = await getFSPluginsMap();
  const pluginDescriptor = fsPluginsMap[bookmark.classId];
  dispatch(
    addViewAction({
      config: bookmark.configName,
      backend: pluginDescriptor,
      startNode: bookmark.startNode,
    })
  );
};
