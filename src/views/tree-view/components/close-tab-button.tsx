import React from 'react';
import IconButton from 'components/buttons/icon-button';
import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';
import CloseIcon from 'components/icons/close-icon';
import { useDispatch } from 'react-redux';
import { removeViewAction } from 'store/features/views/views.slice';
import { useTreeViewCtx } from '../hook/use-tree-view-ctx.hook';

const useStyles = createUseStyles<Theme>((theme) => ({
  closeTabBtn: {
    flexShrink: 0,
  },
  closeTab: {
    width: theme.size.iconButtonScale * 10,
    height: theme.size.iconButtonScale * 10,
    fill: theme.colors.error,
  },
}));

const CloseTabButton = () => {
  const viewIndex = useTreeViewCtx();
  const classes = useStyles();
  const dispatch = useDispatch();
  const onClick = () => {
    dispatch(removeViewAction({ viewIndex }));
  };
  return (
    <IconButton className={classes.closeTabBtn} onButtonClick={onClick}>
      <CloseIcon className={classes.closeTab} />
    </IconButton>
  );
};

export default CloseTabButton;
