import React, { useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { PluginCategories } from 'elcommander-plugin-sdk';
import { Theme } from 'theme/jss-theme.provider';
import SimpleTable from 'components/table/simple-table';
import { PluginManager } from 'plugins/manager/plugin-manager';
import {
  InstalledPackage,
  InstalledPackages,
  SearchedPackage,
  SearchedPackages,
} from 'plugins/manager/npm.types';
import IconButton from 'components/buttons/icon-button';
import PlusIcon from 'components/icons/plus-icon';
import MinusIcon from 'components/icons/minus-icon';
import UpdateIcon from 'components/icons/update-icon';
import WithSpinner from 'components/spinner/with-spinner';
import { setPluginsThunk } from 'store/features/preferences/preferences.actions';
import Toggle from '../../../components/toggle/toggle';
import { getPluginsByCategory } from '../../../store/features/preferences/preferences.selectors';
import { RootState } from '../../../store/root-types';
import { togglePluginAction } from '../../../store/features/preferences/preferences.slice';

const useStyles = createUseStyles<Theme>((theme) => ({
  tablesWrapper: {
    display: 'flex',
    height: '100%',
    alignItems: 'stretch',
    '& > *': {
      flex: '0 0 50%',
      overflow: 'auto',
      '&:not(:last-child)': {
        borderRight: '1px solid #000',
      },
    },
  },
  plusIcon: {
    width: theme.size.iconScale * 15,
    height: theme.size.iconScale * 15,
  },
  verticalCenter: {
    alignItems: 'center',
  },
  installedActions: {
    display: 'flex',
    alignItems: 'center',
  },
  pluginHeader: {
    marginLeft: 5,
  },
}));

interface PluginTabContentProps {
  category: PluginCategories;
  label: string;
}

const headings = [
  { label: 'Name', size: '1fr' },
  { label: 'Version', size: 'auto' },
  { label: '', size: 'auto' },
];

const PluginTabContent: React.FC<PluginTabContentProps> = ({ category }) => {
  const classes = useStyles();
  const currentPlugins = useSelector((state: RootState) =>
    getPluginsByCategory(state, category)
  );
  const dispatch = useDispatch();
  const pluginManager = useRef(new PluginManager(category));
  const queryClient = useQueryClient();
  const installedPackagesKey = `installedPackages${category}`;
  const foundPackagesKey = `foundPackages${category}`;

  const installedQuery = useQuery<InstalledPackages>(
    `installedPackages${category}`,
    {
      initialData: {},
      queryFn: () => pluginManager.current.list(),
      onSuccess: (pckgs) => {
        dispatch(setPluginsThunk(category, pckgs));
      },
      onError: (err) => {
        console.log('err', err);
      },
      refetchOnWindowFocus: false,
    }
  );

  const foundQuery = useQuery<SearchedPackages>(`foundPackages${category}`, {
    initialData: [],
    queryFn: () => pluginManager.current.search(),
    refetchOnWindowFocus: false,
  });

  const outdatedQuery = useQuery<InstalledPackages>(
    `outdatedPackages${category}`,
    {
      initialData: {},
      queryFn: () => pluginManager.current.getOutdatedPackages(),
      refetchOnWindowFocus: false,
    }
  );

  const installPackage = useMutation(
    (foundPackage: SearchedPackage) =>
      pluginManager.current.add(foundPackage.name),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(installedPackagesKey);
        queryClient.invalidateQueries(foundPackagesKey);
      },
    }
  );

  const removePackage = useMutation(
    (installedPackage: InstalledPackage) =>
      pluginManager.current.remove(installedPackage.name),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(installedPackagesKey);
        queryClient.invalidateQueries(foundPackagesKey);
      },
    }
  );

  useEffect(() => {
    return () => {
      pluginManager.current.abortAll();
    };
  }, [pluginManager]);
  return (
    <WithSpinner
      className={classes.tablesWrapper}
      loading={installPackage.isLoading || removePackage.isLoading}
    >
      <section>
        <h3>Found</h3>
        <SimpleTable className={classes.verticalCenter} headings={headings}>
          {foundQuery.isSuccess && !foundQuery.isFetching && !foundQuery.isError
            ? foundQuery.data.map((foundPackage) => [
                foundPackage.name,
                foundPackage.version,
                <IconButton
                  key={foundPackage.name}
                  disabled={installPackage.isLoading}
                  onButtonClick={() => installPackage.mutate(foundPackage)}
                >
                  <PlusIcon className={classes.plusIcon} />
                </IconButton>,
              ])
            : []}
          {foundQuery.isFetching ? ['Loading...'] : []}
          {foundQuery.isError ? ['Error'] : []}
        </SimpleTable>
      </section>
      <section>
        <h3 className={classes.pluginHeader}>Installed</h3>
        <SimpleTable className={classes.verticalCenter} headings={headings}>
          {installedQuery.isSuccess &&
          !installedQuery.isFetching &&
          !installedQuery.isError
            ? Object.values(installedQuery.data).map((installedPackage) => [
                installedPackage.name,
                installedPackage.version,
                <div
                  className={classes.installedActions}
                  key={installedPackage.name}
                >
                  {outdatedQuery.data &&
                    outdatedQuery.data[installedPackage.name] && (
                      <IconButton>
                        <UpdateIcon className={classes.plusIcon} />
                      </IconButton>
                    )}
                  <Toggle
                    size={15}
                    title="Enable/Disable"
                    checked={!!currentPlugins[installedPackage.name]?.enabled}
                    onChange={() => {
                      dispatch(
                        togglePluginAction({
                          name: installedPackage.name,
                          category,
                        })
                      );
                    }}
                    id={installedPackage.name}
                  />
                  <IconButton
                    onButtonClick={() => removePackage.mutate(installedPackage)}
                  >
                    <MinusIcon className={classes.plusIcon} />
                  </IconButton>
                </div>,
              ])
            : []}
          {installedQuery.isFetching ? ['Loading...'] : []}
          {installedQuery.isError ? ['Error'] : []}
        </SimpleTable>
      </section>
    </WithSpinner>
  );
};

export default PluginTabContent;
