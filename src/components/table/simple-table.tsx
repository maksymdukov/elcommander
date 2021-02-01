import React from 'react';
import { createUseStyles } from 'react-jss';
import { Theme } from '../../theme/jss-theme.provider';
import clsx from 'clsx';

const useStyles = createUseStyles<Theme>(() => ({
  simpleTable: {
    display: 'grid',
    gridTemplateColumns: (props: SimpleTableProps) =>
      props.headings.map((heading) => heading.size).join(' '),
    gap: '2px 2px',
  },
  heading: {
    padding: 5,
  },
  cell: {
    padding: 5,
  },
}));

interface SimpleTableProps {
  className?: string;
  headings: { label: string; size: string }[];
  children: Array<React.ReactNode>[];
}

const SimpleTable: React.FC<SimpleTableProps> = (props) => {
  const { headings, children, className } = props;
  const classes = useStyles(props);
  return (
    <div className={clsx(classes.simpleTable, className)}>
      {headings.map((heading, idx) => (
        <div key={idx} className={classes.heading}>
          {heading.label}
        </div>
      ))}
      {children.flat(2).map((node, idx) => (
        <div key={idx} className={classes.cell}>
          {node}
        </div>
      ))}
    </div>
  );
};

export default SimpleTable;
