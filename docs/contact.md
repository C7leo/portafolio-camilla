# Contact / Section 07

`src/modules/profile/presentation/contact/contact.js` renders the editorial closing spread with native, bilingual typography, a black 55/45 text-and-art panel, and four contact tiles. `src/modules/profile/presentation/contact/contact.css` scopes the layout to `#contact`: desktop uses a 17/83 introduction/panel split, tablet places the introduction above the panel, and mobile stacks the headline and illustration. The color accents match the Hero: lime `#C7FF35` and violet `#9747FF`.

The supplied `/assets/profile/contact/07_gato.png` is displayed unchanged with its original transparency, `object-fit: contain`, and no filters. Its built-in heart, star, whiskers and MEOW lettering are not duplicated. Text and decorations outside that PNG remain HTML/SVG.

`src/modules/profile/presentation/contact/contact-motion.js` provides one-time GSAP entrances and a slow 6px CSS float. An intersection observer pauses the float offscreen; document visibility pauses it in background tabs. Reduced motion disables entrances and floating. The Back to top link retains its position when focused so the existing section-focus handler cannot move it between pointer-down and pointer-up and cancel its click.

Email, LinkedIn and GitHub in `src/modules/profile/domain/profile.js` use the contact details supplied by Camilla. The email domain punctuation was normalized from gmail,com to gmail.com. Email uses a mailto link and social links open a new tab with noopener. CV remains null and its tile is explicitly pending and noninteractive until a file is supplied. Test-only fixture URLs are never added to the profile.

Validation: `npx playwright test tests/contact.spec.js tests/navigation.spec.js tests/reading-flow.spec.js --workers=1`. Contact tests exercise EN/ES at 320, 390, 768, 1200, 1440 and 1920px, title/art separation, panel bounds, horizontal overflow, original PNG alpha, real link construction, back-to-top behavior, offscreen animation pausing and reduced motion. Browser validation uses locally installed Chrome.
