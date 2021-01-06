import { useEffect, useRef } from 'react';

export const usePreviousValue = <T>(val: T) => {
  const ref = useRef<T>(val);
  useEffect(() => {
    ref.current = val;
  }, [val]);
  return ref.current;
};
