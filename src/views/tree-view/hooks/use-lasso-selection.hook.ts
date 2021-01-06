import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';
import { useContainerRef } from './use-container-ref.hook';
import { usePreviousValue } from '../../../utils/use-previous-value.hook';
import {
  lassoSelectFinishAction,
  lassoSelectItem,
  lassoSelectMoveAction,
  lassoSelectStartAction,
  resetSelectedItemsAction,
  TreeActions,
  TreeState,
} from '../tree-view-state';
import { AUTOSCROLL_SPEED_COEF, AUTOSCROLL_ZONE } from '../tree-view.constants';
import { IFSBackend } from '../../../backends/interfaces/fs-backend.interface';
import {
  findTreeNodeFromPoint,
  getRelativeCoordinates,
  performAutoScroll,
} from '../tree-view.utils';

interface UseLassoSelectionProps {
  treeState: TreeState;
  dispatch: React.Dispatch<TreeActions>;
  fsManager: IFSBackend;
}

export const useLassoSelection = ({
  treeState,
  dispatch,
}: UseLassoSelectionProps) => {
  const containerRef = useContainerRef();
  // TODO
  // recalculate on window resize
  // container coords on the window
  const containerAbsCoordsRef = useRef<DOMRect | null>();
  const autoScrollSpeedRef = useRef<number | null>(null);
  const performAutoScrollSub = useRef<{ cancel(): void } | null>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const prevScrollPos = usePreviousValue(scrollPos);

  // to identify direction of lasso (up/down)
  const currentYPositionRef = useRef<null | number>(null);
  currentYPositionRef.current = treeState.lassoCoords.current;
  // false - up, true - down
  const lassoDirectionRef = useRef<boolean | null>(null);
  //

  const currentMouseYRef = useRef(0);

  // react to scroll change
  // change lasso dimension if scrolling
  useLayoutEffect(() => {
    if (autoScrollSpeedRef.current !== null && scrollPos !== prevScrollPos) {
      // true - going down, false - going up
      lassoDirectionRef.current = scrollPos - prevScrollPos > 0;
      // if () {
      //   // TODO
      //   // if we just scrolled to the bottom or to the top
      //    // set lasso position to the actual mouse coord;
      //    // or set it to the bottom/top of the container if mouse below or above container
      // }
      dispatch(
        lassoSelectMoveAction({
          currentY: lassoDirectionRef.current
            ? containerAbsCoordsRef.current!.height +
              scrollPos -
              AUTOSCROLL_ZONE
            : scrollPos + AUTOSCROLL_ZONE,
          scrolling: true,
        })
      );
    }
  }, [scrollPos, treeState.lassoScrolling]);

  // react to coords changes
  // select items
  useEffect(() => {
    if (treeState.lassoCoords.current !== null) {
      let yPosition = currentMouseYRef.current;
      // mouse is below container
      // choose the last item
      if (containerAbsCoordsRef.current!.bottom < currentMouseYRef.current) {
        yPosition = containerAbsCoordsRef.current!.bottom - 1;
      }
      // mouse is above container
      // choose the first item
      if (currentMouseYRef.current < containerAbsCoordsRef.current!.top) {
        yPosition = containerAbsCoordsRef.current!.top + 1;
      }
      const foundNode = findTreeNodeFromPoint(
        containerAbsCoordsRef.current!.x + 10, // +10 to be inside container
        yPosition
      );
      // console.log('foundNode', foundNode);
      if (foundNode?.$$treeNode && lassoDirectionRef.current !== null) {
        // update selection
        dispatch(
          lassoSelectItem(foundNode.$$treeNode, lassoDirectionRef.current)
        );
      }
    }
  }, [treeState.lassoCoords, treeState.lassoActive]);

  const changeScrollState = (_: Event) => {
    setScrollPos(containerRef!.current!.scrollTop);
  };

  const windowMouseMoveListener = throttle(
    (e: MouseEvent) => {
      // if user wants to scroll faster and moves mouse - cancel previous autoScroll
      performAutoScrollSub.current?.cancel();
      const { pageY } = e;
      currentMouseYRef.current = pageY;
      if (!containerAbsCoordsRef.current) {
        throw new Error('container coords are not set');
      }
      const {
        current: { top: containerTop, bottom: containerBottom },
      } = containerAbsCoordsRef;
      const { y } = getRelativeCoordinates(
        pageY,
        containerRef!.current!,
        containerRef!.current!
      );

      const isScrolledToBottom =
        Math.round(containerRef!.current!.scrollTop) ===
        Math.round(
          containerRef!.current!.scrollHeight -
            containerAbsCoordsRef.current!.height
        );

      const isScrolledToTop =
        Math.round(containerRef!.current!.scrollTop) === 0;

      if (pageY < containerTop + AUTOSCROLL_ZONE && !isScrolledToTop) {
        // autoscroll up
        autoScrollSpeedRef.current =
          (containerTop + AUTOSCROLL_ZONE - pageY) * AUTOSCROLL_SPEED_COEF;
        performAutoScrollSub.current = performAutoScroll(() => {
          containerRef?.current?.scrollBy(0, -autoScrollSpeedRef.current!);
        });
      } else if (
        pageY > containerBottom - AUTOSCROLL_ZONE &&
        !isScrolledToBottom
      ) {
        // autoscroll down
        autoScrollSpeedRef.current =
          (pageY - containerBottom + AUTOSCROLL_ZONE) * AUTOSCROLL_SPEED_COEF;
        performAutoScrollSub.current = performAutoScroll(() => {
          containerRef?.current?.scrollBy(0, autoScrollSpeedRef.current!);
        });
      } else {
        // just change lasso on the screen
        autoScrollSpeedRef.current = null;
        const yCoord = Math.min(y, containerRef!.current!.scrollHeight);
        if (currentYPositionRef.current !== null) {
          lassoDirectionRef.current = yCoord > currentYPositionRef.current;
        }
        dispatch(lassoSelectMoveAction({ currentY: yCoord }));
      }
    },
    20,
    { trailing: true }
  );

  const windowMouseUpListener = (e: MouseEvent) => {
    lassoDirectionRef.current = null;
    performAutoScrollSub.current?.cancel();
    autoScrollSpeedRef.current = null;
    currentYPositionRef.current = null;
    const { y } = getRelativeCoordinates(
      e.pageY,
      containerRef!.current!,
      containerRef!.current!
    );
    dispatch(lassoSelectFinishAction(y));
    window.removeEventListener('mouseup', windowMouseUpListener);
    window.removeEventListener('mousemove', windowMouseMoveListener);
    containerRef?.current?.removeEventListener('scroll', changeScrollState);
  };

  const lassoStart = (e: React.MouseEvent) => {
    const firstNodeCandidate = findTreeNodeFromPoint(e.pageX, e.pageY);
    if (!firstNodeCandidate || !firstNodeCandidate.$$treeNode) {
      console.error('Cant find first treeNode when starting lasso');
      return;
    }
    // set initial value for scrollPosition state
    setScrollPos(containerRef!.current!.scrollTop);
    dispatch(resetSelectedItemsAction());
    // save container coords
    containerAbsCoordsRef.current = containerRef!.current!.getBoundingClientRect();
    const { y } = getRelativeCoordinates(
      e.pageY,
      containerRef!.current!,
      containerRef!.current!
    );
    // save lassoCoords.start coordinate
    dispatch(lassoSelectStartAction(y, firstNodeCandidate.$$treeNode));

    containerRef?.current?.addEventListener('scroll', changeScrollState);
    window.addEventListener('mouseup', windowMouseUpListener);
    window.addEventListener('mousemove', windowMouseMoveListener);
  };

  return {
    lassoStart,
  };
};
