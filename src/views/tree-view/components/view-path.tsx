import React from 'react';
import { useSelector } from 'react-redux';
import { getStartPath } from '../../../redux/features/views/views.selectors';
import { RootState } from '../../../redux/root-types';
import './view-path.global.scss';

interface ViewPathProps {
  index: number;
}

const ViewPath: React.FC<ViewPathProps> = ({ index }) => {
  const currentPath = useSelector((state: RootState) =>
    getStartPath(state, index)
  );
  return <div className="view-path">{currentPath}</div>;
};

export default ViewPath;
