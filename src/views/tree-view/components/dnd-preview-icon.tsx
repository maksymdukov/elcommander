import React from 'react';
import PlusIcon from '../../../components/icons/plus-icon';
import MinusIcon from '../../../components/icons/minus-icon';
import classes from './dnd-preview-icon.scss';
import { useDndPreviewContext } from '../hook/use-dnd-preview-context.hook';
import { useDndContext } from '../hook/use-dnd-context.hook';

const PREVIEW_OFFSET = 15;

const DndPreviewIcon: React.FC = () => {
  const { mouseY, mouseX } = useDndPreviewContext();
  const { state } = useDndContext();

  if (mouseY === null || mouseX === null) return null;

  return (
    <div
      style={{
        transform: `translate(${mouseX + PREVIEW_OFFSET}px, ${
          mouseY + PREVIEW_OFFSET
        }px)`,
      }}
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
