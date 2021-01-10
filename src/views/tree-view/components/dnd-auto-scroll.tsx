import { useEffect, useRef } from 'react';
import { useDndPreviewContext } from '../hook/use-dnd-preview-context.hook';
import { AUTOSCROLL_DND_SPEED, AUTOSCROLL_ZONE } from '../tree-view.constants';
import { performAutoScroll } from '../tree-view.utils';

const isWithinRange = (
  point: number,
  { from, to }: { from: number; to: number }
) => point >= from && point <= to;

const isScrolledToTop = (
  container: HTMLDivElement,
  overlap: ReturnType<typeof getAutoScrollZoneOverlap>
) => container.scrollTop === 0 && overlap === 'top';

const isScrolledToBottom = (
  container: HTMLDivElement,
  containerHeight: number,
  overlap: ReturnType<typeof getAutoScrollZoneOverlap>
) =>
  container.scrollTop === container.scrollHeight - containerHeight &&
  overlap === 'bottom';

const getAutoScrollZoneOverlap = (
  point: number,
  containerTop: number,
  containerBottom: number
): 'top' | 'bottom' | null => {
  if (
    isWithinRange(point, {
      from: containerTop,
      to: containerTop + AUTOSCROLL_ZONE,
    })
  ) {
    return 'top';
  }
  if (
    isWithinRange(point, {
      from: containerBottom - AUTOSCROLL_ZONE,
      to: containerBottom,
    })
  ) {
    return 'bottom';
  }
  return null;
};

const DndAutoScroll = () => {
  const { mouseY, mouseX, container } = useDndPreviewContext();
  const containerDimensionsRef = useRef<DOMRect>({
    width: 0,
    height: 0,
    bottom: 0,
    x: 0,
    y: 0,
    left: 0,
    right: 0,
    top: 0,
    toJSON() {},
  });

  // autoscroll subscription
  const autoscrollSubRef = useRef<ReturnType<typeof performAutoScroll> | null>({
    cancel() {},
  });

  useEffect(() => {
    if (container) {
      // save container dimensions;
      containerDimensionsRef.current = container.getBoundingClientRect();
    }
  }, [container]);

  useEffect(() => {
    if (mouseY !== null && mouseX !== null && container !== null) {
      // do autoscroll identification
      const { top, bottom } = containerDimensionsRef.current;
      const overlap = getAutoScrollZoneOverlap(mouseY, top, bottom);

      if (
        overlap === null || // not in the zone
        isScrolledToTop(container, overlap) || // scrolled to the very top
        // scrolled to the very bottom
        isScrolledToBottom(
          container,
          containerDimensionsRef.current.height,
          overlap
        )
      ) {
        // cancel autoscroll
        autoscrollSubRef.current?.cancel();
        autoscrollSubRef.current = null;
      } else if (!autoscrollSubRef.current) {
        // if there's no active scrolling
        // then schedule
        if (overlap === 'top') {
          autoscrollSubRef.current = performAutoScroll(() => {
            container.scrollBy(0, -AUTOSCROLL_DND_SPEED);
          });
        } else if (overlap === 'bottom') {
          autoscrollSubRef.current = performAutoScroll(() => {
            container.scrollBy(0, AUTOSCROLL_DND_SPEED);
          });
        }
      }
    }
  }, [mouseY, mouseX, container]);

  // if we are not doing dnd anymore - cancel
  // or not hovering over container
  useEffect(() => {
    if (
      (mouseY === null || mouseX === null || container === null) &&
      autoscrollSubRef.current
    ) {
      autoscrollSubRef.current?.cancel();
      autoscrollSubRef.current = null;
    }
  }, [mouseY, mouseX, container]);

  // unmount cleanup
  useEffect(
    () => () => {
      if (autoscrollSubRef.current) {
        autoscrollSubRef.current?.cancel();
        autoscrollSubRef.current = null;
      }
    },
    []
  );

  return null;
};

export default DndAutoScroll;
