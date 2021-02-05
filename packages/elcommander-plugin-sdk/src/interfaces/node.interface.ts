import { FsItemTypeEnum } from '../enums/fs-item-type.enum';

export interface TreeNode {
  id: string; // full path
  path: string; // full path
  name: string; // name of file/dir
  meta: { [k: string]: any };
  children: TreeNode['id'][];
  parent?: TreeNode['id'];
  type: FsItemTypeEnum;
  nestLevel: number;
  isOpened: boolean;
  isSelected: boolean;
  isCursored: boolean;
  isHighlighted: boolean;
  isLoading: boolean;
  error: string | null;
}
