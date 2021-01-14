import { TreeState } from '../tree-state.interface';
import { TreeStateUtils } from './tree-state.utils';
import { TreeNode } from '../../../../interfaces/node.interface';
import { IFSRawNode } from '../../../../backends/interfaces/fs-raw-node.interface';

export class DirectoryStateUtils {
  static resetTreeState(state: TreeState) {
    // reset state except from the startPath
    TreeStateUtils.resetTreeStateBy(state, {
      byPath: true,
      allPath: true,
      cursor: true,
      selectedPaths: true,
      startPathError: true,
      startPathLoading: true,
    });
  }

  static insertNodes({
    state,
    parentPath,
    nestLevel = 0,
    nodes,
  }: {
    state: TreeState;
    nodes: IFSRawNode[];
    parentPath?: TreeNode['path'];
    nestLevel?: TreeNode['nestLevel'];
  }) {
    const paths: string[] = [];

    // insert nodes
    nodes.forEach((node) => {
      paths.push(node.path);
      state.byPath[node.path] = {
        path: node.path,
        name: node.name,
        meta: node.meta,
        children: [],
        isCursored: false,
        ...(parentPath !== undefined && { parent: parentPath }),
        isOpened: false,
        isSelected: false,
        isHighlighted: false,
        nestLevel,
        type: node.type,
      };
    });
    return paths;
  }

  static enterDirByPath(
    state: TreeState,
    nodes: IFSRawNode[],
    path: TreeNode['path']
  ) {
    state.startPath = path;
    this.resetTreeState(state);
    const newNodeIds = this.insertNodes({ state, nodes });
    state.allPath.push(...newNodeIds);
  }

  static getParentPath(currentPath: TreeState['startPath']) {
    const currentPathArr = currentPath.split('/');
    const parentPath = currentPathArr
      .slice(0, currentPathArr.length - 1)
      .join('/');
    return parentPath || '/';
  }
}
