import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { remote } from 'electron';
import Tabs, { TabItem } from '../../components/tabs/tabs';
import TabPanel from '../../components/tabs/tab-panel';
import PluginsTabContent from './components/plugins-tab-content';
import { Theme } from '../../theme/jss-theme.provider';
import PluginIcon from '../../components/icons/plugin-icon';
import Button from '../../components/buttons/button';

const useStyles = createUseStyles<Theme>((theme) => ({
  main: {
    height: '100vh',
    display: 'flex',
    alignItems: 'stretch',
  },
  tabs: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: `2px solid ${theme.colors.tertiary}`,
  },
  tabBtn: {
    display: 'flex',
    flexDirection: 'column',
    padding: '3px 25px',
    borderRadius: 0,
    color: theme.text.colors.primary,
    '&:hover': {
      color: theme.text.colors.primaryInverse,
      fill: theme.text.colors.primaryInverse,
    },
  },
  tabBtnActive: {
    background: theme.colors.primary,
    color: theme.text.colors.primaryInverse,
    fill: theme.text.colors.primaryInverse,
  },
  tabContentWrapper: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  tabContent: {
    flexGrow: 1,
    overflow: 'auto',
    padding: 10,
  },
  preferenceActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    fontSize: '1.2rem',
    padding: 10,
    '& > *': {
      marginLeft: 10,
    },
  },
  preferenceBtn: {
    '&:hover': {
      color: theme.text.colors.primaryInverse,
    },
  },
}));

const tabs: TabItem[] = [
  { label: 'Plugins', icon: PluginIcon, tab: PluginsTabContent },
];

const Main = () => {
  const classes = useStyles();
  const [currentTab, setCurrentTab] = useState(0);
  return (
    <main className={classes.main}>
      <Tabs
        className={classes.tabs}
        tabClassName={classes.tabBtn}
        activeClassName={classes.tabBtnActive}
        tabs={tabs}
        value={currentTab}
        onChange={(_, newTab) => setCurrentTab(newTab)}
      />
      <section className={classes.tabContentWrapper}>
        <section className={classes.tabContent}>
          {tabs.map(({ tab: Tab }, idx) => (
            <TabPanel key={idx} value={currentTab} index={idx}>
              <Tab />
            </TabPanel>
          ))}
        </section>
        <section className={classes.preferenceActions}>
          <Button
            className={classes.preferenceBtn}
            transparent
            outlined
            color="error"
            onClick={() => remote.getCurrentWindow().close()}
          >
            Close
          </Button>
          <Button
            className={classes.preferenceBtn}
            transparent
            outlined
            color="primary"
          >
            Apply
          </Button>
        </section>
      </section>
    </main>
  );
};

export default Main;
