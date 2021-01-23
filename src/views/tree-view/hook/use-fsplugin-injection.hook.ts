import { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useSelector } from 'react-redux';
import { getFSBackendsMap, IFSPluginDescriptor } from 'backends/backends-map';
import { RootState } from 'store/root-types';
import {
  getViewClassId,
  getViewConfigName,
} from 'store/features/views/views.selectors';
import { PluginPersistence } from 'plugins/plugin-persistence';
import { createAppendedElement, removeElement } from 'utils/dom/element';
import { UserCancelError } from 'error/fs-plugin/user-cancel.error';
import { FsPlugin } from 'backends/abstracts/fs-plugin.abstract';

interface UseDependencyInjectionHookProps {
  viewId: string;
  index: number;
  onSuccessfulInit: (fsPlugin: FsPlugin, viewIndex: number) => void;
  onFailInit: (e: any, viewIndex: number) => void;
}

export const useFsPluginInjection = ({
  index,
  viewId,
  onSuccessfulInit,
  onFailInit,
}: UseDependencyInjectionHookProps) => {
  const [
    fsPluginDescriptor,
    setFsPluginDescriptor,
  ] = useState<IFSPluginDescriptor | null>(null);
  const [fsPlugin, setFsPlugin] = useState<FsPlugin | null>(null);
  const domContainerRef = useRef<Element>();

  const [instantiating, setInstantiating] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const classId = useSelector((state: RootState) =>
    getViewClassId(state, index)
  );
  const configName = useSelector((state: RootState) =>
    getViewConfigName(state, index)
  );

  // DI
  useEffect(() => {
    // instantiate FsPlugin
    if (!fsPlugin && !instantiating) {
      setInstantiating(true);

      // inject
      (async () => {
        const FSPluginMap = await getFSBackendsMap();
        setFsPluginDescriptor(FSPluginMap[classId]);
        const FsPluginKlass = FSPluginMap[classId].klass;

        // our app's global class to allow plugins access to fs
        const pluginPersistence = new PluginPersistence(
          FsPluginKlass.Persistence.category,
          FsPluginKlass.Persistence.dirName
        );

        // implementation of plugin's specific persistence class
        const persistence = new FsPluginKlass.Persistence(pluginPersistence);

        // give plugin dom container
        const domContainer = createAppendedElement();
        domContainerRef.current = domContainer;

        // create plugin instance
        const instance = await FsPluginKlass.createInstance({
          viewId,
          persistence,
          configName,
          domContainer,
        });
        unstable_batchedUpdates(() => {
          setInstantiating(false);
          setInitializing(true);
          setFsPlugin(instance);
        });
        try {
          await instance.onInit();
          setInitializing(false);
          onSuccessfulInit(instance, index);
          // TODO
          // dispatch this.configName save
        } catch (e) {
          // dispatch removeView action
          onFailInit(e, index);
          console.log('error was caught', e);
          if (e instanceof UserCancelError) {
            // do nothing
            return;
          }
          // TODO
          // dispatch error notification
        }
      })();
    }
  }, [
    setInitializing,
    onFailInit,
    fsPlugin,
    classId,
    configName,
    instantiating,
    initializing,
    viewId,
    setFsPluginDescriptor,
    index,
    onSuccessfulInit,
  ]);

  // cleanup
  useEffect(() => {
    return () => {
      if (fsPlugin) {
        (async () => {
          await fsPlugin.onDestroy();
          if (domContainerRef.current) {
            removeElement(domContainerRef.current);
            domContainerRef.current = undefined;
          }
        })();
      }
    };
  }, [fsPlugin]);

  // remove domContainer in case fsPlugin.onInit fails
  useEffect(
    () => () => {
      if (domContainerRef.current) {
        removeElement(domContainerRef.current);
        domContainerRef.current = undefined;
      }
    },
    []
  );

  return {
    fsPluginDescriptor,
    fsPlugin,
    instantiating,
    initializing,
  };
};
