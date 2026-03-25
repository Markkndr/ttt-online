export function useAudio() {
  const play = (name) => {
    const map = {
      hover: '/hoverSound.mp3',
      click: '/clickSound.mp3',
      noclick: '/noClickSound.mp3',
      gamestart: '/gamestartSound.mp3',
      player: '/playerSound.mp3',
      computer: '/computerSound.mp3',
      type: '/type.mp3'
    };
    const src = map[name];
    if (!src) return;
    const a = new Audio(src);
    a.play().catch(() => {});
  };
  return { play };
}
