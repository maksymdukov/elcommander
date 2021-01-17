import React, { CSSProperties } from 'react';
import './rect-spinner.global.css';

const RectSpinner = ({ style }: { style: CSSProperties }) => {
  return (
    <div className="lds-facebook" style={style}>
      <div />
      <div />
      <div />
    </div>
  );
};

export default RectSpinner;
