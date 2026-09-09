import React from "react";

export function Icon({ path, size = 18, className = "", strokeWidth = 1.75, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon ${className}`}
      {...props}
    >
      {path}
    </svg>
  );
}

export const BagIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    }
  />
);

export const SearchIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    }
  />
);

export const XIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    }
  />
);

export const PlusIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </>
    }
  />
);

export const MinusIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M5 12h14" />
      </>
    }
  />
);

export const CheckIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M20 6 9 17l-5-5" />
      </>
    }
  />
);

export const StarIcon = ({ filled = false, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 16}
    height={props.size || 16}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon ${props.className || ""}`}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const TrashIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </>
    }
  />
);

export const ArrowRightIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    }
  />
);

export const ArrowLeftIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </>
    }
  />
);

export const ChevronRightIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="m9 18 6-6-6-6" />
      </>
    }
  />
);

export const ChevronDownIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="m6 9 6 6 6-6" />
      </>
    }
  />
);

export const TruckIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3v10" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </>
    }
  />
);

export const ShieldCheckIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </>
    }
  />
);

export const SparklesIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </>
    }
  />
);

export const PackageIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </>
    }
  />
);

export const ClockIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    }
  />
);

export const AlertCircleIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </>
    }
  />
);

export const UserIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    }
  />
);

export const LogOutIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </>
    }
  />
);

export const SlidersIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <line x1="4" x2="4" y1="21" y2="14" />
        <line x1="4" x2="4" y1="10" y2="3" />
        <line x1="12" x2="12" y1="21" y2="12" />
        <line x1="12" x2="12" y1="8" y2="3" />
        <line x1="20" x2="20" y1="21" y2="16" />
        <line x1="20" x2="20" y1="12" y2="3" />
        <line x1="1" x2="7" y1="14" y2="14" />
        <line x1="9" x2="15" y1="8" y2="8" />
        <line x1="17" x2="23" y1="16" y2="16" />
      </>
    }
  />
);

export const LockIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    }
  />
);

export const MailIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </>
    }
  />
);

export const RefreshIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </>
    }
  />
);

export const EditIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </>
    }
  />
);

export const UploadIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
      </>
    }
  />
);

export const ImageIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </>
    }
  />
);
