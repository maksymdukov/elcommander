import React from 'react';
import { IconProps } from 'components/icons/icon.interface';
import { useStyles } from './toolbar-icon.styles';

interface ToolbarIconProps {
  Icon: React.FC<IconProps<SVGSVGElement>>;
}

const ToolbarIcon: React.FC<ToolbarIconProps> = ({ Icon }) => {
  const classes = useStyles();
  return <Icon className={classes.toolbarIcon} />;
};

export default ToolbarIcon;
