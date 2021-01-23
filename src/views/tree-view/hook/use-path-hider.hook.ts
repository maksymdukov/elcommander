import { useLayoutEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { splitByDelimiter } from '../../../utils/path';

export const usePathHider = (currentPath: string, width: number) => {
  const viewPathContainer = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [visiblePath, setVisiblePath] = useState<string[]>([]);
  const [hiddenPath, setHiddenPath] = useState<string[]>([]);

  useLayoutEffect(() => {
    // once currentPath or width has changed - make container invisible
    unstable_batchedUpdates(() => {
      setIsVisible(false);
      setHiddenPath([]);
      setVisiblePath(splitByDelimiter(currentPath));
    });
  }, [currentPath, setIsVisible, width]);

  useLayoutEffect(() => {
    // if current path changed and useEffect toggled isVisible to false
    // then proceed
    if (viewPathContainer.current && !isVisible) {
      // check to see if overflowing
      const containerWidth = viewPathContainer.current.clientWidth;
      const containerScrollWidth = viewPathContainer.current.scrollWidth;
      if (containerScrollWidth > containerWidth && visiblePath.length !== 1) {
        // unstable_batchedUpdates(() => {
        // take one from visible (beginning)
        let shifted = '';
        setVisiblePath((prevVisible) => {
          const newVal = [...prevVisible];
          if (newVal.length) {
            shifted = newVal.shift() as string;
          }
          return newVal;
        });
        // add to hidden
        setHiddenPath((prevVisible) => {
          const newVal = [...prevVisible];
          newVal.push(shifted);
          return newVal;
        });
        // });
      } else {
        setIsVisible(true);
      }
    }
  }, [viewPathContainer, isVisible, visiblePath, hiddenPath]);

  const getContainerStyles = () => ({
    visibility: isVisible ? 'initial' : 'hidden',
  });

  return { visiblePath, hiddenPath, viewPathContainer, getContainerStyles };
};
