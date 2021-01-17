import { MutableRefObject, useRef } from 'react';

export const useCurrentValue = <T>(value: T): MutableRefObject<T> => {
  const container = useRef<T>(value);
  container.current = value;
  return container;
};
