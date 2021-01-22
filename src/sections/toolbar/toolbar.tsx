import React from 'react';
import { createUseStyles } from 'react-jss';
import AddTab from './components/add-tab/add-tab';
import { Theme } from '../../theme/jss-theme.provider';

const useStyles = createUseStyles<Theme>((theme) => ({
  toolbar: {
    flexGrow: 0,
    display: 'flex',
    alignItems: 'center',
    padding: 5,
  },
  toolbarFuncs: {
    flexGrow: 0,
    minWidth: 100,
  },
  bookmarks: {
    flexGrow: 1,
    paddingLeft: 10,
    borderLeft: `2px solid ${theme.colors.tertiary}`,
  },
}));

const Toolbar = () => {
  const classes = useStyles();
  return (
    <div className={classes.toolbar}>
      <div className={classes.toolbarFuncs}>
        <AddTab />
      </div>
      <div className={classes.bookmarks}>123</div>
    </div>
  );
};

export default Toolbar;
