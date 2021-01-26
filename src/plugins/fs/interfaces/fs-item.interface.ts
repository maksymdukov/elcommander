import { FsItemTypeEnum } from '../../../enums/fs-item-type.enum';

export interface IFSNode {
  id: string;
  name: string;
  type: FsItemTypeEnum;
}
