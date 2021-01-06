import React from 'react';
import './css-dot.global.scss';
import { IconProps } from './icon.interface';

const CssDot: React.FC<IconProps<HTMLDivElement>> = (props) => {
  return <div {...props} className="file__dot" />;
};

export default CssDot;
