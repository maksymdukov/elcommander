import { TreeNode } from '../../classes/tree-node';

export function getRelativeCoordinates(
  yPosition: number,
  referenceElement: HTMLElement,
  targetElement: HTMLElement
) {
  const position = {
    y: yPosition,
  };

  const offset = {
    top: referenceElement.offsetTop,
  };

  let reference = referenceElement.offsetParent as HTMLElement;

  while (reference) {
    offset.top += reference.offsetTop;
    reference = reference.offsetParent as HTMLElement;
  }

  const scrolls = {
    top: 0,
  };

  reference = targetElement;
  while (reference) {
    scrolls.top += reference.scrollTop;
    reference = reference.parentElement as HTMLElement;
  }
  return {
    y: position.y + scrolls.top - offset.top,
  };
}

function targetVisibilityRelTo(target: HTMLElement, relTo: HTMLElement) {
  const targetRect = target.getBoundingClientRect();
  const containerRect = relTo.getBoundingClientRect();

  const { y } = getRelativeCoordinates(targetRect.y, relTo, target);
  const bottomY = y + targetRect.height;
  const isBelowTop = y > relTo.scrollTop;
  const isAboveBottom = bottomY < containerRect.height + relTo.scrollTop;
  const isVisible = isBelowTop && isAboveBottom;
  return {
    isVisible,
    diff: isAboveBottom
      ? -(relTo.scrollTop - y)
      : bottomY - (relTo.scrollTop + containerRect.height),
  };
}

export const makeVisible = (node: TreeNode, relTo: HTMLElement) => {
  const nativeElement = node.element;
  if (!nativeElement) {
    console.error('Cant get native element to make it visible');
    return;
  }

  const label = nativeElement.querySelector(
    '[data-label="label"]'
  ) as HTMLElement;

  if (!label) {
    console.error('Cant find label');
    return;
  }

  const { isVisible, diff } = targetVisibilityRelTo(label, relTo);
  if (!isVisible) {
    relTo.scrollBy({ behavior: 'auto', top: diff });
  }
};

export const findTreeNodeFromPoint = (x: number, y: number) => {
  let target: HTMLElement | null = document.elementFromPoint(
    x,
    y
  ) as HTMLElement;
  while (target && !target.dataset.tree) {
    target = target.parentElement;
  }
  return target;
};

export const getCoordsRelativeToScreen = (target: HTMLElement) => {
  const targetCoords = target.getBoundingClientRect();
  const winPosY = window.screenY;
  const navHeight = window.outerHeight - window.innerHeight;
  const top = winPosY + navHeight + targetCoords.top;
  return { top, bottom: top + targetCoords.height };
};

export const performAutoScroll = (cb: () => void) => {
  let working = true;

  function innerAutoScroll() {
    if (!working) {
      return;
    }
    cb();
    setTimeout(() => {
      innerAutoScroll();
    }, 20);
  }

  innerAutoScroll();

  return {
    cancel() {
      working = false;
    },
  };
};
