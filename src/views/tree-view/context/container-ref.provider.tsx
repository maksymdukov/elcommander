import React, { ReactNode, useRef } from 'react';
import { ContainerRefContext } from './container-ref.context';

const ContainerRefProvider = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <ContainerRefContext.Provider value={ref}>
      {children}
    </ContainerRefContext.Provider>
  );
};

export default ContainerRefProvider;
