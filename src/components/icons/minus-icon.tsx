import React from 'react';

const MinusIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0"
      y="0"
      enableBackground="new 0 0 512 512"
      version="1.1"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      {...props}
    >
      <circle cx="256" cy="256" r="256" fill="#E04F5F" />
      <path fill="#FFF" d="M119.68 240H391.68V272H119.68z" />
    </svg>
  );
};

export default MinusIcon;
