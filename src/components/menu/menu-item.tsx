import React, { MouseEventHandler, PropsWithChildren } from 'react';
import clsx from 'clsx';
import './menu-item.global.scss';
import { createUseStyles } from 'react-jss';
import { Theme } from '../../theme/jss-theme.provider';
import ArrowIcon from '../icons/arrowIcon';

interface MenuItemProps {
  arrowed?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const useStyles = createUseStyles<Theme>((theme) => ({
  btnInner: {
    flexGrow: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  arrowIcon: {
    marginLeft: 5,
    width: theme.size.iconScale * 10,
    height: theme.size.iconScale * 10,
  },
}));

const MenuItemRaw: React.ForwardRefRenderFunction<
  HTMLLIElement,
  PropsWithChildren<MenuItemProps>
> = ({ className, arrowed = false, onClick, children, ...rest }, ref) => {
  const classes = useStyles();
  return (
    <li ref={ref} className={clsx('menu__item', className)} {...rest}>
      <button type="button" className="menu__item__button" onClick={onClick}>
        <div className={classes.btnInner}>
          <span className={classes.label}>{children}</span>
          {arrowed && <ArrowIcon className={classes.arrowIcon} />}
        </div>
      </button>
    </li>
  );
};

const MenuItem = React.forwardRef<
  HTMLLIElement,
  PropsWithChildren<MenuItemProps>
>(MenuItemRaw);

export default MenuItem;
