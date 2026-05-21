import React from "react";

interface FundSimLogoProps {
  size?: number;
}

export function FundSimLogo({
  size = 32,
}: FundSimLogoProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="7" fill="#0D1220" />
      <rect x="7" y="19" width="4" height="7" rx="1" fill="#6366F1" />
      <rect x="14" y="13" width="4" height="13" rx="1" fill="#818CF8" />
      <rect x="21" y="7" width="4" height="19" rx="1" fill="#A5B4FC" />
    </svg>
  );
}
