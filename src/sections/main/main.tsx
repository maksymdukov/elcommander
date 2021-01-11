import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import classes from './main.scss';
import TreeDndProvider from '../../views/tree-view/context/tree-dnd.provider';
import DndPreviewIcon from '../../views/tree-view/components/dnd-preview-icon';
import {
  getViewIds,
  getViewNames,
} from '../../redux/features/views/views.selectors';
import TreeView from '../../views/tree-view/tree.view';
import DndAutoScroll from '../../views/tree-view/components/dnd-auto-scroll';
import {
  FSBackend,
  IFSConstructorProps,
} from '../../backends/interfaces/fs-backend.interface';
import { LocalFs } from '../../backends/local-fs';

interface IFSManagers {
  [k: string]: new (props: IFSConstructorProps) => FSBackend;
}

interface IDIContainer {
  [k: string]: FSBackend;
}

const FSBackendsMap: IFSManagers = {
  LocalFS: LocalFs,
};

const Main = () => {
  const viewIds = useSelector(
    getViewIds,
    (left, right) => left.length === right.length
  );
  const viewNames = useSelector(
    getViewNames,
    (left, right) => left.length === right.length
  );
  const DIContainerRef = useRef<IDIContainer>({});
  const DIContainer = DIContainerRef.current;

  // TODO
  // useEffect and possibly async instantiation

  // view was added or deleted
  const DIContainerKeys = Object.keys(DIContainer);
  if (DIContainerKeys.length !== viewIds.length) {
    // add new instances
    viewIds.forEach((viewId, idx) => {
      if (!DIContainer[viewId]) {
        // instantiate new fs backend
        const viewName = viewNames[idx];
        DIContainer[viewId] = new FSBackendsMap[viewName]({
          viewId,
        });
      }
    });

    // remove obsolete instances
    const currentDIKeys = Object.keys(DIContainer);
    viewIds.forEach((viewId) => {
      const idx = currentDIKeys.indexOf(viewId);
      if (idx !== -1) {
        currentDIKeys.splice(idx, 1);
      }
    });
    currentDIKeys.forEach((k) => delete DIContainer[k]);
  }

  return (
    <TreeDndProvider>
      <div className={classes.container}>
        {viewIds.map((viewId, idx) => (
          <TreeView key={viewId} fsManager={DIContainer[viewId]} index={idx} />
        ))}
      </div>
      <DndPreviewIcon />
      <DndAutoScroll />
    </TreeDndProvider>
  );
};

export default Main;
