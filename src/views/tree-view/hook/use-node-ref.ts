import { useEffect, useRef } from 'react';

export const useNodeRef = (nodeIndex: number) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.$$treeNode = nodeIndex;
    }
    return () => {
      if (element) {
        delete element.$$treeNode;
      }
    };
  }, [nodeIndex]);

  return ref;
};
