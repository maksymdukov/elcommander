export function getRelativeCoordinates(
  yPosition: number,
  xPosition: number,
  referenceElement: HTMLElement,
  targetElement: HTMLElement
) {
  const position = {
    y: yPosition,
    x: xPosition,
  };

  const offset = {
    top: referenceElement.offsetTop,
    left: referenceElement.offsetLeft,
  };

  let reference = referenceElement.offsetParent as HTMLElement;

  while (reference) {
    offset.left += reference.offsetLeft;
    offset.top += reference.offsetTop;
    reference = reference.offsetParent as HTMLElement;
  }

  const scrolls = {
    top: 0,
    left: 0,
  };

  reference = targetElement;
  while (reference) {
    scrolls.left += reference.scrollLeft;
    scrolls.top += reference.scrollTop;
    reference = reference.parentElement as HTMLElement;
  }
  return {
    x: position.x + scrolls.left - offset.left,
    y: position.y + scrolls.top - offset.top,
  };
}

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

export function getScrollBarWidth() {
  const inner = document.createElement('p');
  inner.style.width = '100%';
  inner.style.height = '200px';

  const outer = document.createElement('div');
  outer.style.position = 'absolute';
  outer.style.top = '0px';
  outer.style.left = '0px';
  outer.style.visibility = 'hidden';
  outer.style.width = '200px';
  outer.style.height = '150px';
  outer.style.overflow = 'hidden';
  outer.appendChild(inner);

  document.body.appendChild(outer);
  const w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  let w2 = inner.offsetWidth;
  if (w1 === w2) {
    w2 = outer.clientWidth;
  }
  document.body.removeChild(outer);
  return w1 - w2;
}
