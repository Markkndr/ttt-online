# TTT React Drop-in

This folder contains the React port of your Ultimate Tic-Tac-Toe UI. Copy the contents into your existing React app.

## Files
- src/App.jsx
- src/components/{Home.jsx, GiantBoard.jsx, BigBoard.jsx, Cell.jsx}
- src/hooks/useAudio.js
- src/state/gameLogic.js
- src/styles.css (copy of your legacy style.css)
- public/ (put your sound files here)

## How to integrate
1. Copy `src/` subfolders and `src/App.jsx` into your React project's `src/`.
2. Copy `public` sound files into your project's `public/` folder:
   - hoverSound.mp3
   - clickSound.mp3
   - noClickSound.mp3
   - gamestartSound.mp3
   - playerSound.mp3
   - computerSound.mp3
3. Ensure `App.jsx` imports `./styles.css` and that the class names match.
4. Run your app (CRA: `npm start`, Vite: `npm run dev`).

## Notes
- PVP supports 2 or 3 players. PVE implements an easy AI (random valid move) with hooks for smarter AIs.
- Sounds are referenced by filename from `/public` (see `useAudio.js`).
- If using TypeScript, rename to `.tsx/.ts` and add types; I can do that for you.
- i18n (English/Hungarian) can be added on request.
