// Inline stroke icons from design/Main.dc.html (24x24 viewBox). Static markup only.
export const icons = {
  tv: '<rect x="2" y="5" width="20" height="13" rx="2"/><path d="M8 21h8M10 2l2 3 2-3"/>',
  book: '<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>',
  pen: '<path d="M12 19l7-7 3 3-7 7zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
  yarn: '<circle cx="11" cy="13" r="7"/><path d="M5 11c4 1 8 1 12 0M6 16c3 1 7 1 10 0M15 7l6-5M17 9l5-3"/>',
  cake: '<path d="M4 21h16M5 21v-7h14v7M5 14c0-2 2-3 3.5-3S11 12 12 12s2-1 3.5-1S19 12 19 14M12 11V7M12 4v.01"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
  discord:
    '<path d="M7 5c2-1 3-1 5-1s3 0 5 1c2 3 3 7 3 11-1.5 1.5-3.5 2.5-5 3l-1-2M7 5c-2 3-3 7-3 11 1.5 1.5 3.5 2.5 5 3l1-2M8 15c2.5 1 5.5 1 8 0"/><circle cx="9.5" cy="12" r="1"/><circle cx="14.5" cy="12" r="1"/>',
  tiktok: '<path d="M14 3v11a4 4 0 1 1-4-4M14 3c.5 2.5 2.5 4.5 5 5"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  patreon: '<circle cx="14.5" cy="9.5" r="6.5"/><path d="M4 3v18"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
} as const

export type IconName = keyof typeof icons
