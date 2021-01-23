import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';
import { useDndContext } from 'views/tree-view/hook/use-dnd-context.hook';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { addBookmarkThunk } from 'store/features/bookmarks/bookmarks.actions';
import { getBookmarks } from 'store/features/bookmarks/bookmarks.selectors';
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
    border: `2px solid ${theme.colors.tertiary}`,
  },
}));

const Bookmarks = () => {
  const dispatch = useDispatch();
  const bookmarks = useSelector(getBookmarks);
  const classes = useStyles();
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const { ctxRef, setIsDroppable } = useDndContext();

  const onMouseEnter = () => {
    if (ctxRef.current.isActive) {
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
    if (!ctxRef.current.isActive) {
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
  return (
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
        <BookmarkItem key={idx} bookmark={bookmark} />
      ))}
    </div>
  );
};

export default Bookmarks;
