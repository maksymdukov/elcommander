import React from 'react';
import { IBookmark } from 'store/features/bookmarks/bookmarks.interface';
import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';
import Button from 'components/buttons/button';
import { useDispatch } from 'react-redux';
import { openBookmarkThunk } from 'store/features/bookmarks/bookmarks.actions';
import FolderIcon from 'components/icons/folder-icon';
import { useDndContext } from 'views/tree-view/hook/use-dnd-context.hook';

const useStyles = createUseStyles<Theme>((theme) => ({
  btnWrapper: {
    '&:not(:last-child)': {
      marginRight: 5,
    },
  },
  bookmarkBtn: {
    background: 'transparent',
    color: theme.text.colors.primary,
    border: `1px solid ${theme.colors.primaryLight}`,
    '&:hover': {
      background: theme.colors.tertiaryLight,
      color: theme.text.colors.primaryInverse,
    },
    '&:hover $folderIcon': {
      fill: theme.text.colors.primaryInverse,
    },
    cursor: 'default',
  },
  btnLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  folderIcon: {
    width: theme.size.iconButtonScale * 15,
    height: theme.size.iconButtonScale * 15,
    marginRight: 5,
    fill: theme.bookmarks.colors.folderBg,
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
  const { setIsDroppable } = useDndContext();
  const onMouseEnter = () => {
    setIsDroppable(false);
  };
  const onMouseLeave = () => {
    setIsDroppable(true);
  };
  return (
    <div
      className={classes.btnWrapper}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Button onClick={onClick} className={classes.bookmarkBtn}>
        <div className={classes.btnLabel}>
          <FolderIcon className={classes.folderIcon} />
          {bookmark.startNode.name}
        </div>
      </Button>
    </div>
  );
};

export default BookmarkItem;
