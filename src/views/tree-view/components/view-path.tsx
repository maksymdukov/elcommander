import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStartPath } from 'store/features/views/views.selectors';
import { RootState } from 'store/root-types';
import Button, { ButtonProps } from 'components/buttons/button';
import MenuItem from 'components/menu/menu-item';
import Menu from 'components/menu/menu';
import { exitToParentThunk } from 'store/features/views/actions/tree-dir.actions';
import { useTreeViewCtx } from '../hook/use-tree-view-ctx.hook';
import { useStyles } from './view-path.styles';
import { usePathHider } from '../hook/use-path-hider.hook';
import { useFsPluginCtx } from '../hook/use-fs-manager-ctx.hook';

const ViewPath: React.FC<{ width: number }> = ({ width }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { fsPlugin } = useFsPluginCtx();
  const viewIndex = useTreeViewCtx();
  const currentPath = useSelector((state: RootState) =>
    getStartPath(state, viewIndex)
  );

  const {
    visiblePath,
    hiddenPath,
    viewPathContainer,
    getContainerStyles,
  } = usePathHider(currentPath, width);

  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => {
    setMenuOpen(true);
  };
  const closeMenu = () => {
    setMenuOpen(false);
  };

  const onHiddenPathClick = (idx: number) => () => {
    closeMenu();
    const reversedIdx = hiddenPath.length - 1 - idx;
    const targetPath =
      hiddenPath.filter((_, index) => index <= reversedIdx).join('/') || '/';
    dispatch(exitToParentThunk(viewIndex, fsPlugin, targetPath));
  };
  const onVisiblePathClick = (idx: number) => () => {
    const targetPath =
      [...hiddenPath, ...visiblePath]
        .filter((_, index) => index <= idx + hiddenPath.length)
        .join('/') || '/';
    dispatch(exitToParentThunk(viewIndex, fsPlugin, targetPath));
  };

  const hiddenItems = !!hiddenPath.length && (
    <Menu
      opened={menuOpen}
      onOpen={openMenu}
      onClose={closeMenu}
      trigger={
        <Button transparent className={classes.pathBtn}>
          ...
        </Button>
      }
      position="bottom left"
    >
      {[...hiddenPath].reverse().map((part, idx) => (
        <MenuItem onClick={onHiddenPathClick(idx)} key={idx}>
          {part || '/'}
        </MenuItem>
      ))}
    </Menu>
  );

  const visibleItems = visiblePath.map((part, idx) => {
    const props: React.PropsWithChildren<ButtonProps> = {
      transparent: true,
    };
    // last and not first element
    // display it without '/'
    if (idx === visiblePath.length - 1 && idx !== 0) {
      props.children = part;
    }
    // '/' when there is no hiddenPath
    else if (idx === 0 && !hiddenPath.length) {
      props.children = '/';
    } else {
      props.children = `${part}/`;
    }

    return (
      <Button
        onClick={onVisiblePathClick(idx)}
        className={classes.pathBtn}
        key={idx}
        {...props}
      />
    );
  });

  return (
    <div
      ref={viewPathContainer}
      className={classes.viewPathContainer}
      {...getContainerStyles()}
    >
      <div className={classes.viewPath}>
        {hiddenItems}
        {visibleItems}
      </div>
    </div>
  );
};

export default ViewPath;
