import { FSBackendThreaded } from '../../abstracts/fs-backend-threaded.abstract';
import { GoogleDriveWorker } from './google-drive.worker';
import { TreeNode } from '../../../interfaces/node.interface';

export class GoogleDriveFs extends FSBackendThreaded<GoogleDriveWorker> {
  static getStartNode() {
    return {
      id: 'root',
      name: 'root',
      path: '/',
      meta: {
        parents: ['root'],
      },
    };
  }

  getParentNode(node: TreeNode): TreeNode {
    return {
      ...node,
      meta: {
        ...node.meta,
        parents: node.meta.parents.slice(0, node.meta.parents.length - 1),
      },
    };
  }
}
