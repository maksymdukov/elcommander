import fs from 'fs';
import path from 'path';

export const readAllFilesInDir = async (dirPath: string) => {
  const nodes = await fs.promises.readdir(dirPath, {
    encoding: 'utf8',
    withFileTypes: true,
  });
  const files = nodes.filter((node) => node.isFile());
  const fileContentsPromises = files.map((file) => {
    const filePath = path.join(dirPath, file.name);
    return fs.promises
      .readFile(filePath, { encoding: 'utf8' })
      .then((content) => ({
        name: file.name,
        content,
      }));
  });
  return Promise.all(fileContentsPromises);
};
