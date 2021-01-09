import React, { MutableRefObject, SetStateAction } from 'react';
import {
  LassoContext,
  LassoContextRef,
  LassoContextState,
} from './lasso.context';

interface LassoContextProviderProps {
  refs: MutableRefObject<LassoContextRef>;
  state: LassoContextState;
  setState: React.Dispatch<SetStateAction<LassoContextState>>;
}

const LassoContextProvider: React.FC<LassoContextProviderProps> = ({
  children,
  refs,
  state,
  setState,
}) => {
  return (
    <LassoContext.Provider value={[refs, state, setState]}>
      {children}
    </LassoContext.Provider>
  );
};

export default LassoContextProvider;
