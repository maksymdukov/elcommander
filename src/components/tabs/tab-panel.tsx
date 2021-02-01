import React from 'react';

interface TabPanelProps {
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ value, index, children }) => {
  if (value !== index) return null;
  return <>{children}</>;
};

export default TabPanel;
