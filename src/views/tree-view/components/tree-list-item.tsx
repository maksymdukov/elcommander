import React, { CSSProperties } from 'react';
import { useSelector } from 'react-redux';
import { areEqual } from 'react-window';
import NodeControlIcon from './node-control-icon';
import EntityLabel from './entity-label';
import NodeIcon from './node-icon';
import { getNodeById } from '../../../store/features/views/views.selectors';
import { RootState } from '../../../store/root-types';
import { TreeEventType } from '../../../enums/tree-event-type.enum';
import { useDndNodeHandlers } from '../hook/use-dnd-node-handlers.hook';
import './node.global.scss';
import {
  CHILDREN_OFFSET_PX,
  INITIAL_NODE_OFFSET,
} from '../tree-view.constants';

interface TreeListItemRawProps {
  index: number;
  data: { viewIndex: number; allIds: string[] };
  style: CSSProperties;
}

const TreeListItemRaw: React.FC<TreeListItemRawProps> = ({
  index,
  data,
  style,
}) => {
  // const ref = useNodeRef(index);
  const {
    onMouseUp: handleMouseUp,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseDown: handleMouseDown,
    onDragEnter,
    onDragLeave,
    onDrop,
    onDragOver,
  } = useDndNodeHandlers();
  const node = useSelector((state: RootState) =>
    getNodeById(state, data.viewIndex, data.allIds[index])
  );
  const offset = node.nestLevel * CHILDREN_OFFSET_PX + INITIAL_NODE_OFFSET;

  const onIconPicClick = (e: React.MouseEvent) => {
    if (node.isOpened) {
      e.treeEventType = TreeEventType.CloseNode;
    } else {
      e.treeEventType = TreeEventType.OpenNode;
    }
    e.treeIndex = index;
  };

  const onTitleClick = (e: React.MouseEvent) => {
    e.treeIndex = index;
    if (e.shiftKey) {
      e.treeEventType = TreeEventType.ItemShiftSelect;
      return;
    }
    if (e.ctrlKey) {
      e.treeEventType = TreeEventType.ItemCtrlSelect;
      return;
    }
    e.treeEventType = TreeEventType.ItemCursorSelect;
  };

  const onTitleDoubleClick = (e: React.MouseEvent) => {
    e.treeIndex = index;
    e.treeNode = node;
    e.treeEventType = TreeEventType.EnterNode;
  };

  const onTitleMouseDown = (e: React.MouseEvent) => {
    e.treeIndex = index;
    e.treeNode = node;
    if (e.shiftKey) {
      e.treeEventType = TreeEventType.ItemShiftSelect;
      return;
    }
    if (e.ctrlKey) {
      e.treeEventType = TreeEventType.ItemCtrlSelect;
      return;
    }
    e.treeEventType = TreeEventType.ItemCursorSelect;
    handleMouseDown(e);
  };

  const onContainerMouseDown = (e: React.MouseEvent) => {
    if (e.treeEventType) {
      return;
    }
    e.treeEventType = TreeEventType.LassoSelectStart;
    e.treeIndex = index;
  };

  const onTitleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.treeIndex = index;
    e.treeNode = node;
    e.treeEventType = TreeEventType.MoveSelectionEnter;
    handleMouseEnter(e);
  };
  const onTitleMouseLeave = (e: React.MouseEvent) => {
    e.treeIndex = index;
    e.treeNode = node;
    e.treeEventType = TreeEventType.MoveSelectionLeave;
    handleMouseLeave(e);
  };
  const onTitleMouseUp = (e: React.MouseEvent) => {
    e.treeIndex = index;
    e.treeNode = node;
    e.treeEventType = TreeEventType.MoveSelectionFinish;
    handleMouseUp(e);
  };

  return (
    <div data-tree="node" style={style} onMouseDown={onContainerMouseDown}>
      <div className="node__title" style={{ paddingLeft: offset }}>
        <NodeControlIcon node={node} onClick={onIconPicClick} offset={offset} />
        <EntityLabel
          onDragLeave={onDragLeave(index, node)}
          onDragEnter={onDragEnter(index, node)}
          onDragOver={onDragOver(index, node)}
          onDrop={onDrop(index, node)}
          onClick={onTitleClick}
          onDoubleClick={onTitleDoubleClick}
          onMouseDown={onTitleMouseDown}
          onMouseUp={onTitleMouseUp}
          onMouseLeave={onTitleMouseLeave}
          onMouseEnter={onTitleMouseEnter}
          node={node}
        >
          <NodeIcon node={node} />
        </EntityLabel>
      </div>
    </div>
  );
};

const TreeListItem = React.memo(TreeListItemRaw, areEqual);

export default TreeListItem;
