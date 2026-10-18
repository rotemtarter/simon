// Space scene behind every screen, modeled on the mockups:
// indigo gradient + nebula clouds + stars + a rocky purple landscape at the bottom.
import nebulaUrl from '../assets/nebula.webp';
import starsUrl from '../assets/stars.webp';

const landscape = `
<svg class="space-bg__land" viewBox="0 0 400 190" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="bg-horizon" cx="0.7" cy="0.55" r="0.55">
      <stop offset="0" stop-color="#FF8A3D" stop-opacity="0.75"/>
      <stop offset="0.45" stop-color="#FF2D9B" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#FF2D9B" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bg-rock" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6A4FE0"/>
      <stop offset="1" stop-color="#2A1F86"/>
    </linearGradient>
    <linearGradient id="bg-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3B2AA6"/>
      <stop offset="1" stop-color="#1B1663"/>
    </linearGradient>
  </defs>
  <rect x="0" y="40" width="400" height="120" fill="url(#bg-horizon)"/>
  <path d="M0 118 Q50 92 105 108 T215 98 T320 92 T400 104 V190 H0Z" fill="#33259A" opacity="0.85"/>
  <g fill="url(#bg-rock)">
    <path d="M18 132 q10 -26 34 -22 q20 4 22 24 z"/>
    <path d="M250 126 q14 -34 44 -28 q26 6 26 30 z"/>
    <path d="M330 138 q12 -22 34 -18 q22 4 24 22 z"/>
    <path d="M120 140 q8 -14 22 -12 q14 2 14 14 z"/>
  </g>
  <g fill="none" stroke="#9C82FF" stroke-width="2" stroke-linecap="round" opacity="0.6">
    <path d="M28 116 q12 -8 26 -4"/>
    <path d="M262 106 q16 -10 34 -6"/>
    <path d="M342 124 q12 -6 24 -3"/>
  </g>
  <path d="M0 150 Q90 132 190 146 T400 138 V190 H0Z" fill="url(#bg-ground)"/>
  <ellipse cx="80" cy="166" rx="26" ry="5" fill="#140F4D" opacity="0.6"/>
  <ellipse cx="300" cy="160" rx="18" ry="4" fill="#140F4D" opacity="0.6"/>
</svg>`;

export function renderSpaceBackground(container: HTMLElement): void {
  container.innerHTML = `
    <img class="space-bg__stars" src="${starsUrl}" alt="" />
    <img class="space-bg__nebula" src="${nebulaUrl}" alt="" />
    <div class="space-bg__twinkles"></div>
    ${landscape}
  `;
}
