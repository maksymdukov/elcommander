import { useContext } from 'react';
import { ContainerRefContext } from '../context/container-ref.context';

export const useContainerRef = () => useContext(ContainerRefContext);
