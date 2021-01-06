import React, { MouseEventHandler } from 'react';
import clsx from 'clsx';
import { TreeNode } from '../../classes/tree-node';
import { DirectoryNode } from '../../classes/dir-node';
import ArrowIcon from '../icons/arrowIcon';
import { FileNode } from '../../classes/file-node';
import CssDot from '../icons/css-dot';
import { IconProps } from '../icons/icon.interface';

interface NodeControlIconProps {
  node: TreeNode;
  onClick: MouseEventHandler<HTMLDivElement | SVGSVGElement>;
  offset: number;
}

const NodeControlIcon: React.FC<NodeControlIconProps> = ({
  node,
  onClick,
  offset,
}) => {
  let icon: {
    Icon: React.FC<IconProps<HTMLDivElement | SVGSVGElement>>;
    className?: string;
    onClick?: NodeControlIconProps['onClick'];
  };
  switch (node.constructor) {
    case DirectoryNode:
      icon = {
        Icon: ArrowIcon,
        className: clsx('node__arrow', node.isOpened && 'node__arrow--opened'),
        onClick,
      };
      break;
    case FileNode:
    default:
      icon = { Icon: CssDot };
  }
  return (
    <icon.Icon
      onClick={onClick}
      className={icon.className}
      style={{ left: offset }}
    />
  );
};

export default NodeControlIcon;
