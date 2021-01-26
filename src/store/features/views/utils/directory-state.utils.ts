import { TreeState } from '../tree-state.interface';
import { TreeStateUtils } from './tree-state.utils';
import { TreeNode } from '../../../../interfaces/node.interface';
import { IFSRawNode } from '../../../../plugins/fs/interfaces/fs-raw-node.interface';
import { extractParentPath } from '../../../../utils/path';

export class DirectoryStateUtils {
  static convertRawNode(
    node: IFSRawNode,
    nestLevel = 0,
    parentId?: TreeNode['id']
  ): TreeNode {
    return {
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
  }

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
      state.byId[node.id] = this.convertRawNode(node, nestLevel, parentId);
    });
    return ids;
  }

  static enterDirByPath(state: TreeState, nodes: IFSRawNode[]) {
    state.startNode = this.convertRawNode(nodes[0]);
    this.resetTreeState(state);
    const newNodeIds = this.insertNodes({ state, nodes: nodes.slice(1) });
    state.allIds.push(...newNodeIds);
  }

  static getParentPath(currentPath: string) {
    return extractParentPath(currentPath);
  }
}
