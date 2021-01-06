import React from 'react';
import clsx from 'clsx';
import { TreeNode } from '../../classes/tree-node';
import { DirectoryNode } from '../../classes/dir-node';
import { IconProps } from '../icons/icon.interface';
import FolderIcon from '../icons/folder-icon';
import { FileNode } from '../../classes/file-node';
import FileIcon from '../icons/file-icon';

interface NodeIconProps {
  node: TreeNode;
}

const NodeIcon: React.FC<NodeIconProps> = ({ node }) => {
  let icon: { Element: React.FC<IconProps<SVGSVGElement>>; className?: string };
  switch (node.constructor) {
    case DirectoryNode:
      icon = {
        Element: FolderIcon,
        className: clsx(
          'node__image',
          node.isCursor && 'node__image--selected'
        ),
      };
      break;
    case FileNode:
    default:
      icon = {
        Element: FileIcon,
        className: clsx(
          'node__image',
          node.isCursor && 'node__image--selected'
        ),
      };
  }
  return <icon.Element className={icon.className} />;
};

export default NodeIcon;
