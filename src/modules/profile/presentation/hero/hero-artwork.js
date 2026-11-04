// Editable vector artwork, not photographs or a flattened copy of the reference.
export function violetPanel() {
  return `<svg viewBox="0 0 240 420" preserveAspectRatio="none" aria-hidden="true"><rect width="240" height="420" fill="#5530ed"/><g stroke="#17103c" stroke-width="1.2"><path d="M0 0 90 22 25 100 0 146Z" fill="#8160ff"/><path d="m90 22 100-22-44 112-121-12Z" fill="#4520df"/><path d="m190 0 50 66-94 46Z" fill="#301390"/><path d="m240 66-7 146-87-100Z" fill="#7250ff"/><path d="m25 100 121 12-50 132-96-98Z" fill="#35138f"/><path d="m146 112 87 100-137 32Z" fill="#5530ed"/><path d="m0 146 96 98-70 87L0 285Z" fill="#7855ff"/><path d="m96 244 137-32 7 124-127 13Z" fill="#3512a7"/><path d="m26 331 70-87 17 105-51 71H0Z" fill="#5733ff"/><path d="m113 349 127-13v84H62Z" fill="#8160ff"/><path d="m24 0 9 97 109-58-33 112 92 59-91 32-79 89 99-10 74 99" stroke="#b4a0ff" fill="none"/><path d="m3 47 87-25-19 92m169 10-94-12 23 84M0 194l96 50-42 49m59 56 57 71" stroke="#b4a0ff" fill="none"/></g><g fill="none" stroke="#fff" stroke-opacity=".35"><path d="M10 22 90 44 37 103 15 151m202-60-57 31 58 78-100 39m-72 73 70 29-33 69"/><path d="m180 21-32 84m79 237-104 13 49 61" stroke-width="3"/></g></svg>`;
}

export function architectureStudy() {
  return `<svg viewBox="0 0 300 300" fill="none" aria-hidden="true"><rect width="300" height="300" fill="#dededb"/><path d="m54 300 15-220L199 9l-4 291Z" fill="#b9b9b5"/><path d="M199 9 245 300h-50Z" fill="#ededeb"/><path d="m69 80 130-71-4 291H54Z" stroke="#999993"/><g stroke="#72726c" stroke-width="1">${Array.from({length:11},(_,i)=>`<path d="M${78+i*10} ${77-i*5.4} ${64+i*12} 300"/>`).join('')}${Array.from({length:17},(_,i)=>`<path d="m${68-i*.75} ${91+i*13} ${130+i*.65} ${-65+i*4}"/>`).join('')}</g><path d="m0 247 58-51-4 104H0Zm245-88 55-27v168h-55Z" fill="#a4a49e"/><path d="m10 250 40-35m-40 54 40-35m-40 54 40-35m205-79 35-18m-35 39 35-18m-35 39 35-18m-35 39 35-18m-35 39 35-18m-35 39 35-18" stroke="#dcdcd7"/></svg>`;
}

export function orbitLines() {
  return `<svg class="hero-orbits" viewBox="0 0 1300 665" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M895 70c188-34 299 111 290 260-6 98-105 175-200 200" stroke="#72726d" stroke-width=".85" stroke-dasharray="6 5"/></svg>`;
}

export function linearGeometry() {
  return `<svg viewBox="0 0 60 135" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width=".8"><circle cx="30" cy="25" r="20"/><ellipse cx="30" cy="25" rx="9" ry="20"/><path d="M10 25h40m-37-10q17 10 34 0m-34 20q17-10 34 0M30 5v40"/><ellipse cx="30" cy="62" rx="20" ry="8"/><ellipse cx="30" cy="79" rx="20" ry="8"/><ellipse cx="30" cy="96" rx="20" ry="8"/><ellipse cx="30" cy="113" rx="20" ry="8"/></g></svg>`;
}
