import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';

export interface IFSRawNode {
  id: string;
  path: string;
  name: string;
  type: FsItemTypeEnum;
  meta: {
    [k: string]: any;
  };
}
