import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';

export interface FSItem {
  name: string;
  type: FsItemTypeEnum;
}
