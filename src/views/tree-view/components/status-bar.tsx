import React from 'react';
import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';
import AutoSizer from 'react-virtualized-auto-sizer';
import ViewPath from './view-path';
import CloseTabButton from './close-tab-button';

const useStyles = createUseStyles<Theme>((theme) => ({
  statusBar: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    background: theme.colors.primaryLight,
    borderRight: `1px solid ${theme.text.colors.primaryInverse}`,
  },
  viewPathBox: {
    flexGrow: 1,
    display: 'flex',
  },
}));

const StatusBar = () => {
  const classes = useStyles();
  return (
    <div className={classes.statusBar}>
      <AutoSizer className={classes.viewPathBox} disableHeight>
        {({ width }) => <ViewPath width={width} />}
      </AutoSizer>
      <CloseTabButton />
    </div>
  );
};

export default StatusBar;
