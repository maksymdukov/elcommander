import React from 'react';
import { createUseStyles } from 'react-jss';
import AddTab from './components/add-tab/add-tab';

const useStyles = createUseStyles({
  toolbar: {
    flexGrow: 0,
    display: 'flex',
    alignItems: 'center',
    padding: 5,
  },
});

const Toolbar = () => {
  const classes = useStyles();
  return (
    <div className={classes.toolbar}>
      <AddTab />
    </div>
  );
};

export default Toolbar;
