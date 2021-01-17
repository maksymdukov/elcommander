import React from 'react';
import { IconProps } from './icon.interface';

const ContextMenuIcon: React.FC<IconProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0"
      y="0"
      enableBackground="new 0 0 512 512"
      version="1.1"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      {...props}
    >
      <circle cx="256" cy="256" r="64" />
      <circle cx="256" cy="448" r="64" />
      <circle cx="256" cy="64" r="64" />
    </svg>
  );
};

export default ContextMenuIcon;
