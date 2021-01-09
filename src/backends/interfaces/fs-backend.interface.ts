import { TreeNode } from '../../classes/tree-node';
import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';

export interface IFSBackend {
  readDir: (
    paths: string
  ) => Promise<{ id: string; name: string; type: FsItemTypeEnum }[]>;
}

export type Children = TreeNode[];
