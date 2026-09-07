import type { CSSProperties, ReactNode } from "react";

// OjaX icon set — inline SVGs (24px grid).

const PATH = ({ d, sw = 1.9 }: { d: string; sw?: number }) => (
  <path fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={d} />
);
const FILL = ({ d }: { d: string }) => <path stroke="none" fill="currentColor" d={d} />;

const PATHS: Record<string, ReactNode> = {
  search: <FILL d="M10 2a8 8 0 1 0 4.9 14.32l5.39 5.39 1.42-1.42-5.39-5.39A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />,
  cart: <PATH d="M3 3h2.2l2.4 12.5a1.6 1.6 0 0 0 1.6 1.3h7.7a1.6 1.6 0 0 0 1.57-1.25L20.5 7H5.7M10 21a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Zm7 0a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Z" />,
  heart: <PATH d="M12 20.5S3 15.3 3 9.2A4.9 4.9 0 0 1 12 6a4.9 4.9 0 0 1 9 3.2c0 6.1-9 11.3-9 11.3Z" />,
  chat: <PATH d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.6 9.6 0 0 1-3.4-.6L3 21l1.7-5.2A8.3 8.3 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 9 8.4Z" />,
  user: <PATH d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0" />,
  plus: <FILL d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />,
  minus: <FILL d="M5 11h14v2H5z" />,
  trash: <PATH d="M4 6h16M9 6V4.6A1.6 1.6 0 0 1 10.6 3h2.8A1.6 1.6 0 0 1 15 4.6V6m3.5 0-.7 13.2a1.9 1.9 0 0 1-1.9 1.8H8.1a1.9 1.9 0 0 1-1.9-1.8L5.5 6M10 10.5v6M14 10.5v6" />,
  edit: <PATH d="m14.5 5.5 4 4L8 20H4v-4L14.5 5.5Zm2.5-2.5 2 2a1.6 1.6 0 0 1 0 2.3l-1.5 1.5-4-4 1.5-1.5a1.6 1.6 0 0 1 2 .3Z" />,
  eye: (
    <>
      <PATH d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </>
  ),
  check: <FILL d="m10.6 16.6-4.6-4.6 1.4-1.4 3.2 3.2 6.4-6.4 1.4 1.4-7.8 7.8Z" />,
  x: <FILL d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z" />,
  location: (
    <>
      <PATH d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </>
  ),
  calendar: <PATH d="M4.5 6.8A1.8 1.8 0 0 1 6.3 5h11.4a1.8 1.8 0 0 1 1.8 1.8V19a1.8 1.8 0 0 1-1.8 1.8H6.3A1.8 1.8 0 0 1 4.5 19V6.8ZM4.5 10h15M8.4 3v3.6M15.6 3v3.6" />,
  clock: (
    <>
      <PATH d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <PATH d="M12 7v5l3.4 2" />
    </>
  ),
  send: <FILL d="M3 20.5v-6.2L10.6 12 3 9.7V3.5l20 8.5-20 8.5ZM5.4 8.2 15.5 12l-10.1 3.8v-3l4-.8-4-.8v-3Z" />,
  camera: (
    <>
      <PATH d="M3.5 8.4A1.9 1.9 0 0 1 5.4 6.5h2.2l1.6-2h5.6l1.6 2h2.2a1.9 1.9 0 0 1 1.9 1.9v8.7a1.9 1.9 0 0 1-1.9 1.9H5.4a1.9 1.9 0 0 1-1.9-1.9V8.4Z" />
      <circle cx="12" cy="12.8" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </>
  ),
  upload: <FILL d="M11 16V5.8L7.9 8.9 6.5 7.5 12 2l5.5 5.5-1.4 1.4L13 5.8V16h-2Zm-7 4h16v-2H4v2Z" />,
  shield: (
    <>
      <PATH d="M12 2.8 20 6v5.6c0 5.3-3.4 8.6-8 10.6-4.6-2-8-5.3-8-10.6V6l8-3.2Z" />
      <PATH d="m8.8 11.8 2.3 2.3 4.2-4.4" />
    </>
  ),
  tag: (
    <>
      <PATH d="m3 12 8.5-8.5a1.8 1.8 0 0 1 1.3-.5H20a1 1 0 0 1 1 1v7.2a1.8 1.8 0 0 1-.5 1.3L12 21 3 12Z" />
      <circle cx="16.5" cy="7.5" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  bolt: <FILL d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" />,
  store: <PATH d="M4 9.5 5.5 4h13L20 9.5M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M5 12v8h14v-8M9 20v-5h6v5" />,
  logout: <PATH d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8M10 12h10m0 0-3-3m3 3-3 3" />,
  package: (
    <>
      <PATH d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <PATH d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21" />
    </>
  ),
  list: (
    <>
      <PATH d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </>
  ),
  bell: <PATH d="M6.5 16.5v-5a5.5 5.5 0 0 1 11 0v5l1.6 2H4.9l1.6-2ZM10 21h4" />,
  grid: <PATH d="M4 4h6.6v6.6H4V4Zm9.4 0H20v6.6h-6.6V4ZM4 13.4h6.6V20H4v-6.6Zm9.4 0H20V20h-6.6v-6.6Z" />,
  arrowR: <FILL d="M13.2 5.6 19 12l-5.8 6.4-1.4-1.3L15.6 13H5v-2h10.6l-3.8-4.1 1.4-1.3Z" />,
  arrowL: <FILL d="M10.8 5.6 5 12l5.8 6.4 1.4-1.3L8.4 13H19v-2H8.4l3.8-4.1-1.4-1.3Z" />,
  filter: <PATH d="M4 6h16M7 12h10M10 18h4" />,
  lock: (
    <>
      <PATH d="M6 10.5V8a6 6 0 0 1 12 0v2.5M5 10.5h14V20H5v-9.5Z" />
      <circle cx="12" cy="15.4" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  truck: (
    <>
      <PATH d="M2.5 6h12v10h-12V6Zm12 4h4l3 3.5V16h-7v-6ZM7 19.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </>
  ),
  eyeOff: <PATH d="M4 4l16 16M10.6 6.2A9.7 9.7 0 0 1 12 6c6.4 0 10 6 10 6a17.6 17.6 0 0 1-3 3.4M6.5 7.6A17.2 17.2 0 0 0 2 12s3.6 6 10 6c.9 0 1.8-.1 2.6-.4" />,
  smartphone: (
    <>
      <PATH d="M7.5 2.5h9A1.5 1.5 0 0 1 18 4v16a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V4a1.5 1.5 0 0 1 1.5-1.5Z" />
      <PATH d="M10 18.5h4" />
    </>
  ),
  laptop: <PATH d="M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v8H4.5v-8ZM2.8 16.5h18.4v1.2a1.8 1.8 0 0 1-1.8 1.8H4.6a1.8 1.8 0 0 1-1.8-1.8v-1.2Z" />,
  tv: (
    <>
      <PATH d="M4 5.5h16a1 1 0 0 1 1 1V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1ZM8 21h8" />
    </>
  ),
  shirt: <PATH d="M8.5 3.5 4 6.5l2.5 4 2-1v11h7v-11l2 1 2.5-4L15.5 3.5a3.5 3.5 0 0 1-7 0Z" />,
  book: <PATH d="M12 6.5C10.2 4.9 7.4 4.5 4 4.5v14c3.4 0 6.2.4 8 2 1.8-1.6 4.6-2 8-2v-14c-3.4 0-6.2.4-8 2Zm0 0v14" />,
  sofa: <PATH d="M5 10.5V8a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 8v2.5M3.5 13a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v3.5a1.5 1.5 0 0 1-1.5 1.5h-15a1.5 1.5 0 0 1-1.5-1.5V13ZM5.5 17.5V20M18.5 17.5V20" />,
  dumbbell: <PATH d="M6.5 8v8M17.5 8v8M3 10.5v3M21 10.5v3M6.5 12h11" />,
  music: <PATH d="M9 18.5V5.5l11-2v13M9 18.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 16.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />,
  sparkles: <FILL d="M12 3.5 13.8 9l5.4 1.9-5.4 1.8L12 18l-1.8-5.3L4.8 11l5.4-2L12 3.5ZM19 14.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6ZM5.5 15l.7 1.8 1.8.7-1.8.7L5.5 20l-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />,
  briefcase: <PATH d="M3.5 7.5A1.5 1.5 0 0 1 5 6h14a1.5 1.5 0 0 1 1.5 1.5V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V7.5ZM9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6M3.5 12h17" />,
  food: <PATH d="M7 3.5v17M4 3.5v6a3 3 0 0 0 6 0v-6M17.5 3.5v17M17.5 3.5C15 3.5 13 6 13 9.5c0 1.4.6 2.5 1.5 3v8M20 3.5c0 6-2.5 9-3.5 9" />,
  school: <PATH d="m12 3 10 5.5-10 5.5L2 8.5 12 3ZM6.5 11.5v4.6c0 1.4 2.5 3.4 5.5 3.4s5.5-2 5.5-3.4v-4.6M22 8.5v5" />,
  bank: <PATH d="M3.5 9.5 12 4l8.5 5.5H3.5ZM5.5 9.5V18M9.5 9.5V18M14.5 9.5V18M18.5 9.5V18M3.5 21h17" />,
  star: <FILL d="m12 3.4 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.5 1-5.8-4.2-4.1 5.8-.8L12 3.4Z" />,
  chevronD: <FILL d="m12 15.2-5.9-5.9 1.4-1.4L12 12.4l4.5-4.5 1.4 1.4-5.9 5.9Z" />,
};

export function Icon({ name, size = 20, color, style }: {
  name: string;
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, ...(color ? { color } : {}), ...style }}>
      {PATHS[name] || PATHS.grid}
    </svg>
  );
}

/** OjaX logo mark: market-stall awning + the "o" of ojà. */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <rect x="2" y="2" width="40" height="40" rx="11" fill="#fff" />
      <path d="M8 34V17.5L22 8l14 9.5V34a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3Z" fill="#ff5a1f" opacity="0.16" />
      <path d="M8 14.5 22 6l14 8.5" stroke="#ff5a1f" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="22" cy="24" r="8.4" fill="none" stroke="#ff5a1f" strokeWidth="4.4" />
      <circle cx="22" cy="24" r="3.4" fill="#ff5a1f" />
    </svg>
  );
}
