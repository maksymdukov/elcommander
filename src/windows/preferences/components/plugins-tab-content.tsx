import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Theme } from '../../../theme/jss-theme.provider';
import Tabs, { TabItem } from '../../../components/tabs/tabs';
import PluginTabContent from './plugin-tab-content';
import TabPanel from '../../../components/tabs/tab-panel';
import { PluginCategories } from '../../../plugins/plugin-categories.type';

const useStyles = createUseStyles<Theme>((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  pluginTabs: {
    display: 'flex',
  },
  pluginTabLabel: {
    border: `1px solid transparent`,
    borderBottom: 'none',
    boxShadow: 'none',
    borderRadius: 0,
    '&:hover': {
      background: theme.background.secondary,
    },
  },
  pluginTabLabelActive: {
    background: theme.background.secondary,
    border: `1px solid ${theme.colors.primary}`,
    borderBottom: 'none',
  },
  pluginsContent: {
    flexGrow: 1,
    minHeight: 0,
    border: `1px solid ${theme.colors.primary}`,
    padding: 5,
  },
}));

const pluginTabs: (TabItem & { category: PluginCategories })[] = [
  { label: 'File System', tab: PluginTabContent, category: 'fs' },
  { label: 'File System', tab: PluginTabContent, category: 'fs' },
];

const PluginsTabContent = () => {
  const classes = useStyles();
  const [currentTab, setCurrentTab] = useState(0);
  return (
    <section className={classes.container}>
      <h2>{pluginTabs[currentTab].label} Plugins</h2>
      <Tabs
        className={classes.pluginTabs}
        tabClassName={classes.pluginTabLabel}
        activeClassName={classes.pluginTabLabelActive}
        tabs={pluginTabs}
        value={currentTab}
        onChange={(_, newValue) => setCurrentTab(newValue)}
      />
      <section className={classes.pluginsContent}>
        {pluginTabs.map(({ tab: Tab, label, category }, index) => (
          <TabPanel key={index} value={currentTab} index={index}>
            <Tab label={label} category={category} />
          </TabPanel>
        ))}
      </section>
    </section>
  );
};

export default PluginsTabContent;
