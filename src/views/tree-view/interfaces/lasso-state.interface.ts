export interface LassoState {
  currentY: number | null;
  startY: number | null;
  mouseY: null | number;
}

export interface LassoMutableState {
  containerCoords: DOMRect | null;
  autoScrollSpeed: number | null;
  performAutoScrollSub: { cancel(): void } | null;
  prevScrollPos: number;
  isActive: boolean;
  startCandidate: number | null;
  endCandidate: number | null;
  currentYPosition: number | null;
  direction: boolean | null;
  mouseY: number | null;
}
