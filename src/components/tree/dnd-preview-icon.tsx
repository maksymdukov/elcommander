import React from 'react';
import PlusIcon from '../icons/plus-icon';
import MinusIcon from '../icons/minus-icon';
import classes from './dnd-preview-icon.scss';

interface DndPreviewIconProps {
  top: number;
  left: number;
  isDroppable: boolean;
}

const DndPreviewIcon: React.FC<DndPreviewIconProps> = ({
  top,
  left,
  isDroppable,
}) => {
  return (
    <div
      style={{ top: top + 15, left: left + 15 }}
      className={classes['preview-icon']}
    >
      {isDroppable ? (
        <PlusIcon className={classes.icon} />
      ) : (
        <MinusIcon className={classes.icon} />
      )}
    </div>
  );
};

export default DndPreviewIcon;
