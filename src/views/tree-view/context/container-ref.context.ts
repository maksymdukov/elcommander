import React, { MutableRefObject } from 'react';

export const ContainerRefContext = React.createContext<MutableRefObject<HTMLDivElement | null> | null>(
  null
);
