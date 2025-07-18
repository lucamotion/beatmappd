import * as React from "react";

export function TaikoIcon(props: { [key: string]: string | number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <g clipPath="url(#clip0_4188_3249)">
        <g clipPath="url(#clip1_4188_3249)">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M21.957 12c0-5.5-4.457-9.957-9.957-9.957S2.043 6.5 2.043 12 6.5 21.957 12 21.957 21.957 17.5 21.957 12M7.327.945A11.9 11.9 0 0 1 12 0a11.9 11.9 0 0 1 4.672.945 11.9 11.9 0 0 1 3.815 2.568A12 12 0 0 1 24 12a11.9 11.9 0 0 1-.945 4.672A11.99 11.99 0 0 1 12 24c-1.619 0-3.191-.317-4.672-.945A11.99 11.99 0 0 1 0 12c0-1.619.317-3.191.945-4.672A11.99 11.99 0 0 1 7.328.945M4.34 12A7.66 7.66 0 0 1 12 4.34 7.66 7.66 0 0 1 19.66 12 7.66 7.66 0 0 1 12 19.66 7.66 7.66 0 0 1 4.34 12m6.383-4.943A5.11 5.11 0 0 0 6.893 12a5.12 5.12 0 0 0 3.83 4.948zM17.106 12a5.11 5.11 0 0 0-3.83-4.943v9.886A5.11 5.11 0 0 0 17.107 12"
            clipRule="evenodd"
          ></path>
        </g>
      </g>
      <defs>
        <clipPath id="clip0_4188_3249">
          <path fill="#fff" d="M0 0h24v24H0z"></path>
        </clipPath>
        <clipPath id="clip1_4188_3249">
          <path fill="#fff" d="M0 0h24v24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}
