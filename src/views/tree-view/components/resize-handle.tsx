import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { unstable_batchedUpdates } from 'react-dom';
import { resizeViewAction } from 'store/features/views/views.slice';
import { useDispatch, useSelector } from 'react-redux';
import {
  getViewsLength,
  getViewWidth,
} from 'store/features/views/views.selectors';
import { RootState } from 'store/root-types';
import { TreeEventType } from 'enums/tree-event-type.enum';
import { usePreviousValue } from 'utils/use-previous-value.hook';
import { useTreeCtx } from 'sections/main/hooks/use-tree-ctx.hook';
import { useTreeViewCtx } from '../hook/use-tree-view-ctx.hook';
import { MIN_TABVIEW_WIDTH, RESIZE_HANDLE_WIDTH } from '../tree-view.constants';

export const getConfinedWidth = (
  currentViewWidth: number,
  prevViewWidth: number,
  diff: number
) => {
  const pairWidth = currentViewWidth + prevViewWidth;
  const newViewWidth = currentViewWidth + diff;
  const newPrevViewWidth = prevViewWidth - diff;
  if (newViewWidth > pairWidth - MIN_TABVIEW_WIDTH) {
    return {
      newCurrentViewWidth: pairWidth - MIN_TABVIEW_WIDTH,
      newPrevViewWidth: pairWidth - (pairWidth - MIN_TABVIEW_WIDTH),
    };
  }

  if (newPrevViewWidth > pairWidth - MIN_TABVIEW_WIDTH) {
    return {
      newCurrentViewWidth: pairWidth - (pairWidth - MIN_TABVIEW_WIDTH),
      newPrevViewWidth: pairWidth - MIN_TABVIEW_WIDTH,
    };
  }

  return {
    newCurrentViewWidth: newViewWidth,
    newPrevViewWidth,
  };
};

const useStyles = createUseStyles({
  resize: {
    position: 'absolute',
    top: 0,
    left: -RESIZE_HANDLE_WIDTH,
    height: '100%',
    width: RESIZE_HANDLE_WIDTH,
    background: 'transparent',
    cursor: 'col-resize',
  },
});

const ResizeHandle = () => {
  const classes = useStyles();
  const { treeContainerRef } = useTreeCtx();
  const viewIndex = useTreeViewCtx();
  const dispatch = useDispatch();

  const viewsLength = useSelector((state: RootState) => getViewsLength(state));
  const prevViewsLength = usePreviousValue(viewsLength);

  const currentViewWidth = useSelector((state: RootState) =>
    getViewWidth(state, viewIndex)
  );
  const previousViewWidth = useSelector((state: RootState) =>
    getViewWidth(state, viewIndex === 0 ? viewIndex : viewIndex - 1)
  );
  const viewWidthRef = useRef({
    initialCurrent: currentViewWidth,
    initialPrevious: previousViewWidth,
    actualCurrent: currentViewWidth,
    actualPrevious: previousViewWidth,
  });
  viewWidthRef.current.actualCurrent = currentViewWidth;
  viewWidthRef.current.actualPrevious = previousViewWidth;
  const [currentPageX, setCurrentPageX] = useState<number | null>(null);
  const [startPageX, setStartPageX] = useState<number | null>(null);
  const [pxInPercent, setPxInPercent] = useState<number | null>(null);

  const onMouseMove = (e: MouseEvent) => {
    setCurrentPageX(e.pageX);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'initial';
    viewWidthRef.current.initialCurrent = viewWidthRef.current.actualCurrent;
    viewWidthRef.current.initialPrevious = viewWidthRef.current.actualPrevious;
    unstable_batchedUpdates(() => {
      setCurrentPageX(null);
      setStartPageX(null);
      setPxInPercent(null);
    });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.treeEventType = TreeEventType.ResizeStart;
    if (treeContainerRef.current === null) {
      return;
    }
    const {
      width: containerWidth,
    } = treeContainerRef.current.getBoundingClientRect();
    setStartPageX(e.pageX);
    setPxInPercent(100 / containerWidth);
    // set window.onMouseMove
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    if (currentPageX !== null && startPageX !== null && pxInPercent !== null) {
      const percentDiff = (startPageX - currentPageX) * pxInPercent;
      const { newCurrentViewWidth, newPrevViewWidth } = getConfinedWidth(
        viewWidthRef.current.initialCurrent,
        viewWidthRef.current.initialPrevious,
        percentDiff
      );
      dispatch(
        resizeViewAction({
          viewIndex,
          viewWidth: newCurrentViewWidth,
          prevViewWidth: newPrevViewWidth,
        })
      );
    }
  }, [currentPageX, startPageX, pxInPercent, dispatch, viewIndex]);

  useEffect(() => {
    if (
      prevViewsLength !== viewsLength ||
      (startPageX === null && currentPageX === null)
    ) {
      viewWidthRef.current.initialCurrent = currentViewWidth;
      viewWidthRef.current.initialPrevious = previousViewWidth;
    }
  }, [
    prevViewsLength,
    viewsLength,
    currentViewWidth,
    previousViewWidth,
    startPageX,
    currentPageX,
  ]);

  if (viewIndex === 0) {
    return null;
  }
  return <div onMouseDown={onMouseDown} className={classes.resize} />;
};

export default ResizeHandle;
