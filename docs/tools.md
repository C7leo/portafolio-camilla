# Section 05: interactive bento grid

`tools-layout.jsx` mounts the original header and hero blocks unchanged.
`tools-bento.jsx` owns the six category cards and a single contextual panel through
React `activeCategory` state. `tools.js` keeps the existing render/init module API.
All styles remain scoped to #ecosystem.

## Content

`src/modules/capabilities/domain/technologies.js` remains the source of names,
experience/learning labels, descriptions and technology lists. Software has nine
registered technologies. Git, Docker, VS Code and Postman are not added because
they are absent from the domain data. Panel headings and short introductions use
contextual EN/ES translations. The existing translation observer handles domain
content and the new nodes when mounted or switched.

`tools-symbols.js` supplies the existing official local vendor logos and distinct
line symbols for concepts without a brand. Each technology has its own small
card. Only the active category's tools are rendered. The previous duplicate
illustration/chip/Quick View panel is removed. The two hero blocks, including the
latest cat position, are preserved. The database overview card retains 05_db.png.

## Layout and interaction

Desktop expands into three zones: selected card, contextual panel, and two
stacked companion cards. The other three cards occupy the next row. Software's
companions are Data & governance and Reporting. Every category uses the same
layout system with its own data. The panel is a normal CSS Grid child: no modal,
overlay, absolute positioning or fixed positioning is used for the panel.

Tablet uses two columns with the panel on a complete row following the active
card's row. Mobile keeps the original card order and inserts the panel directly
after the active card, creating an accordion. Text and logos wrap without clipping.

Reselecting the active card, Close or Escape collapses it. Only one panel can
exist. Arrow keys and Home/End switch categories; native Enter/Space toggle them.
Close restores focus to the selected card. Expanded/pressed states and a polite
status expose selection to assistive technologies.

The project already includes GSAP and browser Web Animations. The bento uses
Web Animations with FLIP measurements to animate card positions and dimensions,
panel fade/expansion and the grid height over 450 ms with
cubic-bezier(0.22, 1, 0.36, 1). Closing fades the panel for 100 ms before the
450 ms grid transition. Rapid switches cancel previous animations and pending
closes. Reduced-motion preference disables layout animation and cancels running
animations when changed live. No animation dependency was added.

## Validation

`tests/tools.spec.js` covers all six lists, original labels/descriptions, local
logo decoding, single-panel toggle, Close/Escape/keyboard, lateral placement,
unchanged hero dimensions, responsive EN/ES at 1920, 1440, 1024, 768, 390 and
320 pixels, no overlaps/clipping/horizontal scroll, rapid switching and live
reduced-motion changes.

```powershell
npm run build
npm run check:architecture
npx playwright test tests/tools.spec.js tests/navigation.spec.js tests/reading-flow.spec.js --workers=1
```
