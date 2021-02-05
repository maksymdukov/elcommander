export const extractParentPath = (currentPath: string) => {
  const currentPathArr = currentPath.split('/');
  const parentPath = currentPathArr
    .slice(0, currentPathArr.length - 1)
    .join('/');
  return parentPath || '/';
};

export const splitByDelimiter = (path: string, delimiter = '/') =>
  path === delimiter ? [''] : path.split(delimiter);
