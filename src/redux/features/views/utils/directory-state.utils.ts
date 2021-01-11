import { TreeState } from '../tree-state.interface';
import { TreeStateUtils } from '../tree-state.utils';
import { IFSNode } from '../../../../backends/interfaces/fs-item.interface';
import { TreeNode } from '../../../../interfaces/node.interface';

export class DirectoryStateUtils {
  static resetTreeState(state: TreeState) {
    // reset state except from the startPath
    TreeStateUtils.resetTreeStateBy(state, {
      byIds: true,
      allIds: true,
      cursor: true,
      selectedIds: true,
    });
  }

  static insertNodes({
    state,
    parentId,
    nestLevel = 0,
    nodes,
  }: {
    state: TreeState;
    nodes: IFSNode[];
    parentId?: TreeNode['id'];
    nestLevel?: TreeNode['nestLevel'];
  }) {
    const ids: string[] = [];

    // insert nodes
    nodes.forEach((node) => {
      ids.push(node.id);
      state.byIds[node.id] = {
        id: node.id,
        name: node.name,
        children: [],
        isCursored: false,
        ...(parentId !== undefined && { parent: parentId }),
        isOpened: false,
        isSelected: false,
        isHighlighted: false,
        nestLevel,
        type: node.type,
      };
    });
    return ids;
  }

  static enterDirByPath(
    state: TreeState,
    nodes: IFSNode[],
    path: TreeNode['id']
  ) {
    state.startPath = path;
    this.resetTreeState(state);
    const newNodeIds = this.insertNodes({ state, nodes });
    state.allIds.push(...newNodeIds);
  }

  static getParentPath(currentPath: TreeState['startPath']) {
    const currentPathArr = currentPath.split('/');
    const parentPath = currentPathArr
      .slice(0, currentPathArr.length - 1)
      .join('/');
    return parentPath || '/';
  }
}
