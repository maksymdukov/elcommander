import React, { useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';
import { ListOnScrollProps } from 'react-window';
import { AUTOSCROLL_SPEED_COEF, AUTOSCROLL_ZONE } from '../tree-view.constants';
import {
  getRelativeCoordinates,
  getScrollBarWidth,
  performAutoScroll,
} from '../tree-view.utils';
import {
  LassoMutableState,
  LassoState,
} from '../interfaces/lasso-state.interface';
import { useLassoContext } from './use-lasso-context';
import { LassoContextValue } from '../context/lasso.context';

interface UseLassoSelectionProps {
  onLassoSelect: (
    start: number | null,
    end: number | null,
    direction: boolean
  ) => void;
  onLassoSelectStart: () => void;
}

export const useLassoSelection = ({
  onLassoSelect,
  onLassoSelectStart,
}: UseLassoSelectionProps) => {
  const [lassoRefs, , setLassoCtx] = useLassoContext() as LassoContextValue;
  const [state, setState] = useState<LassoState>({
    currentY: null,
    startY: null,
    mouseY: null,
  });

  const containerRef = lassoRefs.current.outerRef;
  const itemsCfgRef = lassoRefs.current.itemCfgRef;

  const mutableState = useRef<LassoMutableState>({
    containerCoords: null,
    autoScrollSpeed: null,
    performAutoScrollSub: null,
    prevScrollPos: 0,
    isActive: false,
    startCandidate: null,
    endCandidate: null,
    // current Y relative position of lasso
    // to identify direction of lasso (up/down)
    // ref is used to avoid dependency in throttle function
    currentYPosition: null,
    mouseY: null,
    // uptodate lasso direction
    // false - up, true - down
    direction: null,
  });
  // latest mouse position to use in onScroll
  mutableState.current.mouseY = state.mouseY;
  mutableState.current.currentYPosition = state.currentY;

  const onScroll = ({ scrollOffset, scrollDirection }: ListOnScrollProps) => {
    const {
      current: { autoScrollSpeed, containerCoords, isActive, mouseY },
    } = mutableState;
    if (!isActive) {
      return;
    }

    // true - going down, false - going up
    mutableState.current.direction = scrollDirection === 'forward';

    // autoscroll is happening
    if (autoScrollSpeed !== null) {
      // expand lasso to the top or bottom threshold
      setState((prevState) => ({
        ...prevState,
        currentY: mutableState.current.direction
          ? containerCoords!.height + scrollOffset - AUTOSCROLL_ZONE
          : scrollOffset + AUTOSCROLL_ZONE,
      }));
      return;
    }
    // manual scrolling with wheel while mouse clicked and still
    const { y } = getRelativeCoordinates(
      mouseY!,
      0,
      containerRef!.current!,
      containerRef!.current!
    );
    setState((prevState) => ({
      ...prevState,
      currentY: y,
    }));
  };

  // react to lasso coords changes
  // select items
  useEffect(() => {
    if (
      state.currentY !== null &&
      state.startY !== null &&
      mutableState.current.direction !== null
    ) {
      let idx: number | null =
        Math.ceil(state.currentY / itemsCfgRef.current.size) - 1;
      idx = idx < 0 ? 0 : idx;
      if (idx > itemsCfgRef.current.count - 1) {
        idx = null;
      }

      if (mutableState.current.endCandidate !== idx) {
        // call callback
        let start: number | null = mutableState.current.startCandidate;
        let end: number | null = idx;
        if (idx === null && mutableState.current.startCandidate === null) {
          start = null;
          end = null;
        } else if (mutableState.current.startCandidate === null) {
          start = itemsCfgRef.current.count - 1;
        } else if (idx === null) {
          end = itemsCfgRef.current.count - 1;
        }
        onLassoSelect(start, end, mutableState.current.direction);
      }
      mutableState.current.endCandidate = idx;
    }
  }, [state, itemsCfgRef, onLassoSelect]);

  const windowMouseMoveListener = throttle(
    (e: MouseEvent) => {
      const {
        performAutoScrollSub,
        containerCoords,
        currentYPosition,
      } = mutableState.current;
      const { pageY } = e;
      // if user wants to scroll faster and moves mouse - cancel previous autoScroll
      performAutoScrollSub?.cancel();

      if (!containerCoords) {
        throw new Error('container coords are not set');
      }

      const { top: containerTop, bottom: containerBottom } = containerCoords;
      const { y } = getRelativeCoordinates(
        pageY,
        0,
        containerRef!.current!,
        containerRef!.current!
      );

      const hasScrolledToBottom =
        Math.round(containerRef!.current!.scrollTop) ===
        Math.round(
          containerRef!.current!.scrollHeight - containerCoords.height
        );
      const hasScrolledToTop =
        Math.round(containerRef!.current!.scrollTop) === 0;
      const isMouseAboveTopThreshold =
        pageY < containerTop + AUTOSCROLL_ZONE && !hasScrolledToTop;
      const isMouseBelowBottomThreshold =
        pageY > containerBottom - AUTOSCROLL_ZONE && !hasScrolledToBottom;

      if (isMouseAboveTopThreshold || isMouseBelowBottomThreshold) {
        // autoscroll up or down
        // set autoScroll speed
        mutableState.current.autoScrollSpeed = isMouseAboveTopThreshold // otherwise below bottom threshold
          ? (containerTop + AUTOSCROLL_ZONE - pageY) * AUTOSCROLL_SPEED_COEF
          : (pageY - containerBottom + AUTOSCROLL_ZONE) * AUTOSCROLL_SPEED_COEF;

        const scrollByMargin = isMouseAboveTopThreshold
          ? -mutableState.current.autoScrollSpeed
          : mutableState.current.autoScrollSpeed;

        // schedule iterative scrolling
        mutableState.current.performAutoScrollSub = performAutoScroll(() => {
          containerRef?.current?.scrollBy(0, scrollByMargin);
        });
      } else {
        // just change lasso on the screen

        // reset autoScrollSpeed
        mutableState.current.autoScrollSpeed = null;

        // maximum of currentY coordinate in state should be scrollHeight
        let yCoord = Math.min(y, containerRef!.current!.scrollHeight);
        // minimum - 0
        yCoord = Math.max(0, yCoord);

        // last state.currentY value
        // ref is used to avoid dependencies
        if (currentYPosition !== null) {
          mutableState.current.direction = yCoord > currentYPosition;
        }
        setState((prevState) => ({
          ...prevState,
          currentY: yCoord,
          mouseY: pageY,
        }));
      }
    },
    20,
    { trailing: true }
  );

  const windowMouseUpListener = () => {
    mutableState.current.direction = null;
    mutableState.current.performAutoScrollSub?.cancel();
    mutableState.current.autoScrollSpeed = null;
    mutableState.current.currentYPosition = null;
    mutableState.current.isActive = false;

    setState((prevState) => ({
      ...prevState,
      mouseY: null,
      startY: null,
      currentY: null,
    }));
    window.removeEventListener('mouseup', windowMouseUpListener);
    window.removeEventListener('mousemove', windowMouseMoveListener);
  };

  const startLasso = (e: React.MouseEvent, startIndex: number | null) => {
    // get Y coordinate (absolute positioning) relative to scrollable container
    const { y, x } = getRelativeCoordinates(
      e.pageY,
      e.pageX,
      containerRef.current!,
      containerRef.current!
    );

    // save container coords
    mutableState.current.containerCoords = containerRef!.current!.getBoundingClientRect();
    const scrollWidth = getScrollBarWidth();
    const containerWidth = mutableState.current.containerCoords.width;

    if (x > containerWidth - scrollWidth - 1) {
      // ignore vertical scrollbar click
      return;
    }
    onLassoSelectStart();
    // set initial value for scrollPosition state
    mutableState.current.prevScrollPos = containerRef!.current!.scrollTop;

    mutableState.current.startCandidate = startIndex;
    mutableState.current.endCandidate = null;
    mutableState.current.isActive = true;

    // save lassoCoords.start coordinate
    setState((prevState) => ({
      ...prevState,
      mouseY: e.pageY,
      currentY: null,
      startY: y,
    }));

    window.addEventListener('mouseup', windowMouseUpListener);
    window.addEventListener('mousemove', windowMouseMoveListener);
  };

  // save handlers to the context
  useEffect(() => {
    setLassoCtx((prevState) => ({
      ...prevState,
      startLasso,
      onScroll,
    }));
    // TODO
    // I now what i'm doing
  }, []);

  return {
    current: state.currentY,
    start: state.startY,
  };
};
