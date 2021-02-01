import React from 'react';
import clsx from 'clsx';
import { createUseStyles } from 'react-jss';
import { Theme } from '../../theme/jss-theme.provider';
import RectSpinner from '../animated/rect-spinner';

const useStyles = createUseStyles<Theme>(() => ({
  spinnerWrapper: {
    position: 'relative',
  },
  spinner: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    position: 'absolute',
    zIndex: 10,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

interface WithSpinnerProps {
  className?: string;
  loading?: boolean;
}

const WithSpinner: React.FC<WithSpinnerProps> = ({
  children,
  loading,
  className,
}) => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.spinnerWrapper, className)}>
      {children}
      {loading && (
        <div className={classes.spinner}>
          <RectSpinner />
        </div>
      )}
    </div>
  );
};

export default WithSpinner;
