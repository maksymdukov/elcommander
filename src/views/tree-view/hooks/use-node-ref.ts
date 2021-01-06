import { useEffect, useRef } from 'react';
import { TreeNode } from '../../../classes/tree-node';

export const useNodeRef = (node: TreeNode) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      node.setNativeElement(element);
      element.$$treeNode = node;
    }
    return () => {
      if (element) {
        element.$$treeNode = null;
      }
      node.setNativeElement(null);
    };
  }, [node]);

  useEffect(() => {
    node.markUnchanged();
  });

  return ref;
};
