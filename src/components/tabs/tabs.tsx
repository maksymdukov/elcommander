import React from 'react';
import clsx from 'clsx';
import Button from '../buttons/button';

export interface TabItem {
  label: string;
  icon?: React.FC;
  tab: React.FC<any>;
}

export interface TabsProps {
  tabClassName?: string;
  activeClassName?: string;
  className?: string;
  tabs: Omit<TabItem, 'tab'>[];
  value: number;
  onChange: (event: React.MouseEvent, newValue: number) => void;
}

const Tabs: React.FC<TabsProps> = ({
  className,
  onChange,
  tabClassName,
  activeClassName,
  tabs,
  value,
}) => {
  const onTabClick = (idx: number) => (e: React.MouseEvent) => {
    onChange(e, idx);
  };
  return (
    <div className={className}>
      {tabs.map(({ label, icon: Icon }, idx) => (
        <Button
          transparent
          key={idx}
          className={clsx(tabClassName, idx === value && activeClassName)}
          onClick={onTabClick(idx)}
        >
          {Icon && <Icon />}
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
};

export default Tabs;
