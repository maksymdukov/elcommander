import React from 'react';
import clsx from 'clsx';
import { IconProps } from '../../../components/icons/icon.interface';
import FolderIcon from '../../../components/icons/folder-icon';
import FileIcon from '../../../components/icons/file-icon';
import { TreeNode } from '../../../interfaces/node.interface';
import { FsItemTypeEnum } from '../../../enums/fs-item-type.enum';

interface NodeIconProps {
  node: TreeNode;
}

const NodeIcon: React.FC<NodeIconProps> = ({ node }) => {
  let icon: { Element: React.FC<IconProps<SVGSVGElement>>; className?: string };
  switch (node.type) {
    case FsItemTypeEnum.Directory:
      icon = {
        Element: FolderIcon,
        className: clsx(
          'node__image',
          node.isCursored && 'node__image--selected'
        ),
      };
      break;
    case FsItemTypeEnum.File:
    default:
      icon = {
        Element: FileIcon,
        className: clsx(
          'node__image',
          node.isCursored && 'node__image--selected'
        ),
      };
  }
  return <icon.Element className={icon.className} />;
};

export default NodeIcon;
