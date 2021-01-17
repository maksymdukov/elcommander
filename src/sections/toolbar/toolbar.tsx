import React from 'react';
import AddTab from './components/add-tab';
import './toolbar.global.scss';
import 'reactjs-popup/dist/index.css';

const Toolbar = () => {
  return (
    <div className="toolbar">
      <AddTab />
    </div>
  );
};

export default Toolbar;
