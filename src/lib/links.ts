/** id of the hidden "opens in a new tab" note rendered once in App.vue */
export const NEW_TAB_NOTE_ID = 'new-tab-note'

/** External links open in a new tab (and say so to screen readers); in-page links don't. */
export function linkAttrs(href?: string) {
  return href && /^https?:\/\//.test(href)
    ? { target: '_blank', rel: 'noopener noreferrer', 'aria-describedby': NEW_TAB_NOTE_ID }
    : {}
}
