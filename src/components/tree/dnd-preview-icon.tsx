import React from 'react';
import PlusIcon from '../icons/plus-icon';
import MinusIcon from '../icons/minus-icon';
import classes from './dnd-preview-icon.scss';
import { useDndPreviewContext } from '../../views/tree-view/hooks/use-dnd-preview-context.hook';
import { useDndContext } from '../../views/tree-view/hooks/use-dnd-context.hook';

const DndPreviewIcon: React.FC = () => {
  const { mouseY, mouseX } = useDndPreviewContext();
  const { state } = useDndContext();

  if (mouseY === null || mouseX === null) return null;

  return (
    <div
      style={{ top: mouseY + 15, left: mouseX + 15 }}
      className={classes['preview-icon']}
    >
      {state.isDroppable ? (
        <PlusIcon className={classes.icon} />
      ) : (
        <MinusIcon className={classes.icon} />
      )}
    </div>
  );
};

export default DndPreviewIcon;
