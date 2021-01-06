import fs from 'fs';
import path from 'path';
import { IFSBackend } from './interfaces/fs-backend.interface';
import { DirectoryNode } from '../classes/dir-node';
import { FileNode } from '../classes/file-node';

export class LocalFs implements IFSBackend {
  async readDir(paths: string[], parent: DirectoryNode) {
    const constructedPath = path.join('/', ...paths);
    const files = await fs.promises.readdir(constructedPath, {
      encoding: 'utf8',
      withFileTypes: true,
    });
    return files
      .filter((file) => file.isDirectory() || file.isFile())
      .map((dirent, idx) => {
        return dirent.isDirectory()
          ? new DirectoryNode({ name: dirent.name, parent, idx })
          : new FileNode({ name: dirent.name, parent, idx });
      });
  }
}
