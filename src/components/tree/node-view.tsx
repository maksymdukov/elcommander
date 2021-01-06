import React from 'react';
import { TreeEventType } from '../../enums/tree-event-type.enum';
import EntityLabel from './entity-label';
import { useNodeRef } from '../../views/tree-view/hooks/use-node-ref';
import NodeControlIcon from './node-control-icon';
import NodeIcon from './node-icon';
import { TreeNode } from '../../classes/tree-node';
import { DirectoryNode } from '../../classes/dir-node';
import './node.global.scss';

interface DirectoryProps {
  node: TreeNode;
  offset?: number;
}

const CHILDREN_OFFSET_PX = 26;

const NodeViewRaw: React.FC<DirectoryProps> = ({ node, offset = 0 }) => {
  const ref = useNodeRef(node);

  const childrenOffset = offset + CHILDREN_OFFSET_PX;

  const childrenNode =
    node instanceof DirectoryNode
      ? node.getChildren().map((child, index) => (
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          <NodeView key={index} node={child} offset={childrenOffset} />
        ))
      : null;

  const onIconPicClick = (e: React.MouseEvent) => {
    e.treeEventType = TreeEventType.DirectoryToggle;
    e.treeNode = node;
  };

  const onTitleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey) {
      e.treeEventType = TreeEventType.ItemCtrlSelect;
      e.treeNode = node;
      return;
    }
    e.treeEventType = TreeEventType.ItemCursorSelect;
    e.treeNode = node;
  };

  const onTitleMouseDown = (e: React.MouseEvent) => {
    e.treeEventType = TreeEventType.SelectionMoveMaybeStart;
    e.treeNode = node;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    // ignore if event is handled somewhere
    if (e.treeEventType) {
      return;
    }
    // lasso start
    e.treeEventType = TreeEventType.LassoSelectStart;
    e.treeNode = node;
  };

  return (
    <div ref={ref} onMouseDown={onMouseDown} data-tree="node">
      <div className="node__title" style={{ paddingLeft: offset }}>
        <NodeControlIcon node={node} onClick={onIconPicClick} offset={offset} />
        <EntityLabel
          onClick={onTitleClick}
          node={node}
          onMouseDown={onTitleMouseDown}
        >
          <NodeIcon node={node} />
        </EntityLabel>
      </div>
      {node.isOpened && (
        <section className="node__children">
          <div
            className="node__children-line"
            style={{ left: childrenOffset }}
          />
          {childrenNode}
        </section>
      )}
    </div>
  );
};

const NodeView = React.memo(
  NodeViewRaw,
  (_, nextProps) => !nextProps.node.hasChanged
);

export default NodeView;
