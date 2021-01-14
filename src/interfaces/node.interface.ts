import { FsItemTypeEnum } from '../enums/fs-item-type.enum';

export interface TreeNode {
  path: string; // full path
  name: string; // name of file/dir
  meta: { [k: string]: any };
  children: TreeNode['path'][];
  parent?: TreeNode['path'];
  type: FsItemTypeEnum;
  nestLevel: number;
  isOpened: boolean;
  isSelected: boolean;
  isCursored: boolean;
  isHighlighted: boolean;
}
