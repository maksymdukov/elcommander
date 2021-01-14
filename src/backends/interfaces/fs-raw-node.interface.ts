import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';

export interface IFSRawNode {
  path: string;
  name: string;
  type: FsItemTypeEnum;
  meta: {
    [k: string]: any;
  };
}
