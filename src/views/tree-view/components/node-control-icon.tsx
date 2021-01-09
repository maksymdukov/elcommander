import React, { MouseEventHandler } from 'react';
import clsx from 'clsx';
import ArrowIcon from '../../../components/icons/arrowIcon';
import CssDot from '../../../components/icons/css-dot';
import { IconProps } from '../../../components/icons/icon.interface';
import { TreeNode } from '../../../interfaces/node.interface';
import { FsItemTypeEnum } from '../../../enums/fs-item-type.enum';

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
  switch (node.type) {
    case FsItemTypeEnum.Directory:
      icon = {
        Icon: ArrowIcon,
        className: clsx('node__arrow', node.isOpened && 'node__arrow--opened'),
        onClick,
      };
      break;
    case FsItemTypeEnum.File:
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
