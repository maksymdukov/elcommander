import React from 'react';
import './dash-spinner.global.css';

const DashSpinner = () => {
  return (
    <div className="lds-ellipsis">
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};

export default DashSpinner;
