// Line icons: 24x24, 2px stroke, rounded caps and joins (per the Style Guide).
const line = (paths: string): string =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

export const icons = {
  info: line('<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5h.01"/>'),
  trophy: line(
    '<path d="M8 4h8v6a4 4 0 0 1-8 0V4z"/><path d="M8 6H5a3 3 0 0 0 3 4"/><path d="M16 6h3a3 3 0 0 1-3 4"/><path d="M12 14v4"/><path d="M8.5 20h7"/>',
  ),
  play: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor"/></svg>`,
  infoBadge: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M12 11v6" stroke="#1a1f78" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="7.3" r="1.5" fill="#1a1f78"/></svg>`,
  speaker: line(
    '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/><path d="M18 7a7 7 0 0 1 0 10"/>',
  ),
  back: line('<path d="M15 5l-7 7 7 7"/>'),
  chevron: line('<path d="M14 7l-5 5 5 5"/>'),
};
