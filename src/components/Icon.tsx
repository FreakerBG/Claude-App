type IconName =
  | 'home'
  | 'tasks'
  | 'money'
  | 'habits'
  | 'goals'
  | 'journal'
  | 'insights'
  | 'settings'
  | 'download'
  | 'plus'
  | 'close'
  | 'pulse'

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></>,
  tasks: <><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 2.3 2.3L16 8.7"/></>,
  money: <><path d="M4 7h16v12H4z"/><path d="M4 10c2 0 3-1 3-3m13 3c-2 0-3-1-3-3M4 16c2 0 3 1 3 3m13-3c-2 0-3 1-3 3"/><circle cx="12" cy="13" r="2.4"/></>,
  habits: <><path d="M12.7 2.8c.8 4.2-2.6 5.2-2.6 8.2 0 1.3.8 2.2 1.9 2.2 1.8 0 2.7-1.6 2.2-3.8 2.8 1.7 4.3 4 4.3 6.5A6.3 6.3 0 0 1 12 22a6.3 6.3 0 0 1-6.5-6.1c0-4.3 3.3-7.9 7.2-13.1Z"/></>,
  goals: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m14.8 9.2 5.7-5.7M17 3.5h3.5V7"/></>,
  journal: <><path d="M6 3.5h11a2 2 0 0 1 2 2V21H8a3 3 0 0 1-3-3V4.5a1 1 0 0 1 1-1Z"/><path d="M8 3.5V21M11 8h5M11 12h5"/></>,
  insights: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 20h14"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  pulse: <path d="M2 12h4l2.2-5 3.5 10 2.5-6 1.8 3h6"/>,
}

export function Icon({ name, size = 20, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

export type { IconName }
