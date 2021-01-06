import { CSSProperties, MouseEventHandler } from 'react';

export interface IconProps<T = Element> {
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<T>;
}
