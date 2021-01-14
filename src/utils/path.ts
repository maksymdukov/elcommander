export const extractParentPath = (currentPath: string) => {
  const currentPathArr = currentPath.split('/');
  const parentPath = currentPathArr
    .slice(0, currentPathArr.length - 1)
    .join('/');
  return parentPath || '/';
};
