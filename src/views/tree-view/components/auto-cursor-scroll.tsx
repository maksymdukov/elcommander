import React, { RefObject, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FixedSizeList } from 'react-window';
import { RootState } from '../../../store/root-types';
import {
  getCursorIdx,
  getIsLoadingStartPath,
  getStartPath,
} from '../../../store/features/views/views.selectors';
import { usePreviousValue } from '../../../utils/use-previous-value.hook';

interface AutoScrollProps {
  scrollRef: RefObject<FixedSizeList>;
  index: number;
}

const AutoCursorScroll: React.FC<AutoScrollProps> = ({ scrollRef, index }) => {
  const startPath = useSelector((state: RootState) =>
    getStartPath(state, index)
  );
  const startPathLoading = useSelector((state: RootState) =>
    getIsLoadingStartPath(state, index)
  );
  const prevStartPath = usePreviousValue(startPath);
  const prevStartPathLoading = usePreviousValue(startPathLoading);
  const cursorIndex = useSelector((state: RootState) =>
    getCursorIdx(state, index)
  );
  useEffect(() => {
    if (
      (prevStartPath !== startPath ||
        startPathLoading !== prevStartPathLoading) &&
      cursorIndex !== null &&
      scrollRef.current
    ) {
      scrollRef.current.scrollToItem(cursorIndex, 'smart');
    }
  }, [
    startPath,
    scrollRef,
    cursorIndex,
    prevStartPath,
    startPathLoading,
    prevStartPathLoading,
  ]);
  return null;
};

export default AutoCursorScroll;
