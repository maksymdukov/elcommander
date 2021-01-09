import fs from 'fs';
import nPath from 'path';
import { IFSBackend } from './interfaces/fs-backend.interface';
import { FsItemTypeEnum } from '../enums/fs-item-type.enum';

export class LocalFs implements IFSBackend {
  async readDir(
    path: string
  ): Promise<{ id: string; name: string; type: FsItemTypeEnum }[]> {
    const files = await fs.promises.readdir(nPath.normalize(path), {
      encoding: 'utf8',
      withFileTypes: true,
    });
    return files
      .filter((file) => file.isDirectory() || file.isFile())
      .map((dirent) => {
        return {
          type: dirent.isDirectory()
            ? FsItemTypeEnum.Directory
            : FsItemTypeEnum.File,
          name: dirent.name,
          id: `${path}/${dirent.name}`,
        };
      });
  }
}
