import React, { CSSProperties } from 'react';
import classes from './rect-spinner.scss';

const RectSpinner = ({ style }: { style: CSSProperties }) => {
  return (
    <div className={classes['lds-facebook']} style={style}>
      <div />
      <div />
      <div />
    </div>
  );
};

export default RectSpinner;
