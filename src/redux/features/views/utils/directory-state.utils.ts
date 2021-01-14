import { TreeState } from '../tree-state.interface';
import { TreeStateUtils } from './tree-state.utils';
import { TreeNode } from '../../../../interfaces/node.interface';
import { IFSRawNode } from '../../../../backends/interfaces/fs-raw-node.interface';
import { extractParentPath } from '../../../../utils/path';

export class DirectoryStateUtils {
  static resetTreeState(state: TreeState) {
    // reset state except from the startPath
    TreeStateUtils.resetTreeStateBy(state, {
      byId: true,
      allIds: true,
      cursor: true,
      selectedIds: true,
      startPathError: true,
      startPathLoading: true,
    });
  }

  static insertNodes({
    state,
    parentId,
    nestLevel = 0,
    nodes,
  }: {
    state: TreeState;
    nodes: IFSRawNode[];
    parentId?: TreeNode['id'];
    nestLevel?: TreeNode['nestLevel'];
  }) {
    const ids: string[] = [];

    // insert nodes
    nodes.forEach((node) => {
      ids.push(node.id);
      state.byId[node.id] = {
        id: node.id,
        path: node.path,
        name: node.name,
        meta: node.meta,
        nestLevel,
        type: node.type,
        children: [],
        isCursored: false,
        ...(parentId !== undefined && { parent: parentId }),
        isOpened: false,
        isSelected: false,
        isHighlighted: false,
        isLoading: false,
        error: null,
      };
    });
    return ids;
  }

  static enterDirByPath(
    state: TreeState,
    nodes: IFSRawNode[],
    path: TreeNode['path']
  ) {
    state.startPath = path;
    this.resetTreeState(state);
    const newNodeIds = this.insertNodes({ state, nodes });
    state.allIds.push(...newNodeIds);
  }

  static getParentPath(currentPath: TreeState['startPath']) {
    return extractParentPath(currentPath);
  }
}
