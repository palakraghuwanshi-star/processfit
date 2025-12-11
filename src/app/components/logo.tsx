import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width="1em"
    height="1em"
    {...props}
  >
    <g fill="currentColor">
      <path d="M208.2,99.1a88,88,0,1,1-111.3-51.3" />
      <path d="M168,40h48V88" />
      <path d="M88,216H40V168" />
    </g>
  </svg>
);