import React from 'react';

const UpdateIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="512"
      height="512"
      viewBox="0 0 512 512"
      {...props}
    >
      <linearGradient
        id="SVGID_1_"
        x1="256"
        x2="256"
        y1="496"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#00b59c" />
        <stop offset="1" stopColor="#9cffac" />
      </linearGradient>
      <path
        fill="url(#SVGID_1_)"
        d="M391 376c66.72 0 121-53.832 121-120 0-56.848-40.789-105.299-96.495-116.755C396.735 67.226 331.274 16 256 16S115.266 67.227 96.494 139.245C40.789 150.701 0 199.152 0 256c0 66.168 54.28 120 121 120h120v32.58c-12.764 4.527-22.893 14.656-27.42 27.42H106c-8.284 0-15 6.716-15 15s6.716 15 15 15h107.58c6.192 17.458 22.865 30 42.42 30s36.228-12.542 42.42-30H406c8.284 0 15-6.716 15-15s-6.716-15-15-15H298.42c-4.527-12.764-14.656-22.893-27.42-27.42V376zm-135 90c-8.271 0-15-6.729-15-15s6.729-15 15-15 15 6.729 15 15-6.729 15-15 15zM121 346c-50.178 0-91-40.374-91-90 0-45.189 34.657-83.308 80.615-88.667a15 15 0 0012.99-12.054C135.837 91.958 191.517 46 256 46s120.163 45.958 132.394 109.278a14.997 14.997 0 0012.99 12.054C447.343 172.692 482 210.811 482 256c0 49.626-40.822 90-91 90zm195-120c-8.284 0-15 6.716-15 15v15h-90v-15c0-8.284-6.716-15-15-15s-15 6.716-15 15v30c0 8.284 6.716 15 15 15h120c8.284 0 15-6.716 15-15v-30c0-8.284-6.716-15-15-15zm-70.609-4.396A15.123 15.123 0 00256 226c3.807 0 7.73-1.517 10.609-4.396l29.998-29.998c5.858-5.858 5.858-15.355 0-21.213-5.857-5.858-15.355-5.858-21.213 0L271 174.787V121c0-8.284-6.716-15-15-15s-15 6.716-15 15v53.787l-4.394-4.394c-5.857-5.858-15.355-5.858-21.213 0s-5.858 15.355 0 21.213z"
      />
    </svg>
  );
};

export default UpdateIcon;