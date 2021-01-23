import React from 'react';
import { IBookmark } from 'store/features/bookmarks/bookmarks.interface';
import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';
import Button from 'components/buttons/button';
import { useDispatch } from 'react-redux';
import { openBookmarkThunk } from '../../../../store/features/bookmarks/bookmarks.actions';

const useStyles = createUseStyles<Theme>((theme) => ({
  bookmarkBtn: {
    fontWeight: 'bold',
    background: theme.bookmarks.colors.folderBg,
    color: theme.bookmarks.colors.folder,
    '&:not(:last-child)': {
      marginRight: 5,
    },
    '&:hover': {
      background: theme.tools.darken(theme.bookmarks.colors.folderBg, 20),
    },
  },
}));

interface BookmarkItemProps {
  bookmark: IBookmark;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const onClick = () => {
    dispatch(openBookmarkThunk(bookmark));
  };
  return (
    <Button onClick={onClick} className={classes.bookmarkBtn}>
      {bookmark.startNode.name}
    </Button>
  );
};

export default BookmarkItem;
