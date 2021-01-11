import { FsItemTypeEnum } from '../enums/fs-item-type.enum';

export interface TreeNode {
  id: string; // full path
  name: string; // name of file/dir
  children: TreeNode['id'][];
  parent?: TreeNode['id'];
  type: FsItemTypeEnum;
  nestLevel: number;
  isOpened: boolean;
  isSelected: boolean;
  isCursored: boolean;
  isHighlighted: boolean;
}
