import React, { MutableRefObject, SetStateAction } from 'react';
import { ListOnScrollProps } from 'react-window';

export type LassoContextRef = {
  outerRef: MutableRefObject<HTMLDivElement | undefined>;
  itemCfgRef: MutableRefObject<{ count: number; size: number }>;
};

export type LassoContextState = {
  onScroll?: (props: ListOnScrollProps) => void;
  startLasso?: (e: React.MouseEvent, startIndex: number | null) => void;
};

export type LassoContextValue = [
  MutableRefObject<LassoContextRef>,
  LassoContextState,
  React.Dispatch<SetStateAction<LassoContextState>>
];

export const LassoContext = React.createContext<LassoContextValue | null>(null);
