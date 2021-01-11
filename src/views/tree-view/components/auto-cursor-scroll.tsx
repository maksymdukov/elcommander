import React, { RefObject, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FixedSizeList } from 'react-window';
import { RootState } from '../../../redux/root-types';
import {
  getCursorIdx,
  getStartPath,
} from '../../../redux/features/views/views.selectors';
import { usePreviousValue } from '../../../utils/use-previous-value.hook';

interface AutoScrollProps {
  scrollRef: RefObject<FixedSizeList>;
  index: number;
}

const AutoCursorScroll: React.FC<AutoScrollProps> = ({ scrollRef, index }) => {
  const startPath = useSelector((state: RootState) =>
    getStartPath(state, index)
  );
  const prevStartPath = usePreviousValue(startPath);
  const cursorIndex = useSelector((state: RootState) =>
    getCursorIdx(state, index)
  );
  useEffect(() => {
    if (
      scrollRef.current &&
      prevStartPath !== startPath &&
      cursorIndex !== null
    ) {
      scrollRef.current.scrollToItem(cursorIndex, 'center');
    }
  }, [startPath, scrollRef, cursorIndex, prevStartPath]);
  return null;
};

export default AutoCursorScroll;
