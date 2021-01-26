import React, { useCallback, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';
import { useDndContext } from 'views/tree-view/hook/use-dnd-context.hook';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { addBookmarkThunk } from 'store/features/bookmarks/bookmarks.actions';
import { removeBookmarkAction } from 'store/features/bookmarks/bookmarks.slice';
import { getBookmarks } from 'store/features/bookmarks/bookmarks.selectors';
import { FsItemTypeEnum } from 'enums/fs-item-type.enum';
import NativeMenu from 'components/native-menu/native-menu';
import { MenuItemConstructorOptions } from 'electron';
import BookmarkItem from './bookmark-item';

const useStyles = createUseStyles<Theme>((theme) => ({
  bookmarksContainer: {
    height: '100%',
    width: '100%',
    paddingLeft: 10,
    display: 'flex',
    alignItems: 'center',
    border: `2px solid transparent`,
  },
  bookmarksDraggedOver: {
    outline: `2px solid ${theme.colors.tertiary}`,
  },
}));

const Bookmarks = () => {
  const dispatch = useDispatch();
  const bookmarks = useSelector(getBookmarks);
  const classes = useStyles();
  const [contextMenuTemplate, setContextMenuTemplate] = useState<
    MenuItemConstructorOptions[] | null
  >(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const { ctxRef, setIsDroppable, state } = useDndContext();

  const onMouseEnter = () => {
    if (
      ctxRef.current.isActive &&
      ctxRef.current.startNode?.type === FsItemTypeEnum.Directory
    ) {
      setIsDroppable(true);
      setIsDraggedOver(true);
    }
  };

  const onMouseLeave = () => {
    if (ctxRef.current.isActive) {
      setIsDroppable(false);
      setIsDraggedOver(false);
    }
  };

  const onMouseUp = () => {
    if (
      !ctxRef.current.isActive ||
      ctxRef.current.startNode?.type !== FsItemTypeEnum.Directory ||
      !state.isDroppable
    ) {
      return;
    }
    setIsDroppable(false);
    setIsDraggedOver(false);
    if (
      ctxRef.current.startViewIndex === null ||
      ctxRef.current.startNode === null
    ) {
      return;
    }
    // add bookmark
    dispatch(
      addBookmarkThunk(ctxRef.current.startViewIndex, ctxRef.current.startNode)
    );
  };

  const onContextClick = (idx: number) => () => {
    setContextMenuTemplate([
      {
        label: 'Remove bookmark',
        click() {
          dispatch(removeBookmarkAction({ idx }));
          setContextMenuTemplate(null);
        },
      },
    ]);
  };

  const onMenuClose = useCallback(() => {
    setContextMenuTemplate(null);
  }, [setContextMenuTemplate]);

  return (
    <>
      <div
        className={clsx(
          classes.bookmarksContainer,
          isDraggedOver && classes.bookmarksDraggedOver
        )}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
      >
        {bookmarks.map((bookmark, idx) => (
          <BookmarkItem
            key={idx}
            bookmark={bookmark}
            onContextClick={onContextClick(idx)}
          />
        ))}
      </div>
      <NativeMenu template={contextMenuTemplate} onClose={onMenuClose} />
    </>
  );
};

export default Bookmarks;
