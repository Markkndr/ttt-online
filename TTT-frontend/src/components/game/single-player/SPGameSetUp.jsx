import { useState } from 'react';
import { useAudio } from '../../../hooks/useAudio';

const CHARSET = ['◯','✖','△'];

export default function Home({ onStart }) {
  const { play } = useAudio();
  const [mode, setMode] = useState(null); // 'pvp' | 'pve'
  const [playerCount, setPlayerCount] = useState(2);
  const [difficulty, setDifficulty] = useState('easy'); // easy|medium|hard|unbeatable
  const [chars, setChars] = useState([]); // chosen tokens in order
  const [rotation, setRotation] = useState([]); // chosen start order (tokens)
  const [step, setStep] = useState('intro'); // intro | mode | pvpCount | pveDiff | char | start | leaving
  const [leaving, setLeaving] = useState(false);
  const [entering, setEntering] = useState(false);

  const go = (next) => {
    setStep(next);
    setEntering(true);
    setTimeout(() => setEntering(false), 30);
  };

  const requiredChars = mode === 'pvp' ? playerCount : 2;
  const remainingChars = CHARSET.filter(c => !chars.includes(c));

  const canChooseStart = (mode === 'pvp' && chars.length === playerCount) ||
                         (mode === 'pve' && chars.length === 2);

  const finishEnabled = (rotation.length === (mode === 'pvp' ? playerCount : 2));

  const addChar = (ch) => {
    if (chars.includes(ch)) { play('noclick'); return; }
    if (chars.length < requiredChars) {
      play('click');
      const next = [...chars, ch];
      setChars(next);
      const needed = requiredChars;
      if (next.length === needed) {
        go('start');
      }
    } else {
      play('noclick');
    }
  };

  const addStart = (ch) => {
    play('click');
    if (!chars.includes(ch)) return;
    if (rotation.includes(ch)) return;
    const needed = mode === 'pvp' ? playerCount : 2;
    if (rotation.length < needed) {
      const next = [...rotation, ch];
      if (mode === 'pvp' && playerCount === 3 && next.length === 2) {
        const third = chars.find(x => !next.includes(x));
        setRotation([...next, third]);
        // animate out then start
        setLeaving(true);
        setTimeout(() => {
          play('gamestart');
          onStart({ mode, playerCount, difficulty, chars, rotation: [...next, third] });
        }, 400);
      } else if (mode === 'pvp' && playerCount === 2 && next.length === 1) {
        const second = chars.find(x => x !== ch);
        setRotation([ch, second]);
        setLeaving(true);
        setTimeout(() => {
          play('gamestart');
          onStart({ mode, playerCount, difficulty, chars, rotation: [ch, second] });
        }, 400);
      } else if (mode === 'pve' && next.length === 1) {
        const second = chars.find(x => x !== ch);
        setRotation([ch, second]);
        setLeaving(true);
        setTimeout(() => {
          play('gamestart');
          onStart({ mode, playerCount, difficulty, chars, rotation: [ch, second] });
        }, 400);
      } else {
        setRotation(next);
      }
    }
  };

  const startGame = () => {
    play('gamestart');
    onStart({ mode, playerCount, difficulty, chars, rotation });
  };

  return (
    <main>
      <>
        <h2 className={`helptext ${step !== 'mode' ? 'outRight2' : ''} ${step === 'mode' && entering ? 'outBelow' : ''}`}>CHOOSE GAME MODE!</h2>
        <button
          className={[
            'leftButton pvp',
            step !== 'mode' ? 'outLeft' : (entering ? 'outBelow' : '')
          ].join(' ')}
          onMouseOver={() => play('hover')}
          onClick={() => { play('click'); setMode('pvp'); go('pvpCount'); }}
          style={{ pointerEvents: step !== 'mode' ? 'none' : undefined }}
        >
          PLAYER{'\n'}vs{'\n'}PLAYER
        </button>
        <button
          className={[
            'rightButton pve',
            step !== 'mode' ? 'outRight' : (entering ? 'outBelow' : '')
          ].join(' ')}
          onMouseOver={() => play('hover')}
          onClick={() => { play('click'); setMode('pve'); go('pveDiff'); }}
          style={{ pointerEvents: step !== 'mode' ? 'none' : undefined }}
        >
          PLAYER{'\n'}vs{'\n'}COMPUTER
        </button>
      </>

      {mode === 'pvp' && (
        <>
          <h2 className={`helptext ${step !== 'pvpCount' ? 'outRight2' : ''} ${step === 'pvpCount' && entering ? 'outBelow' : ''}`}>HOW MANY PLAYERS?</h2>
          <button
            className={[
              'leftButton playerCount two',
              step !== 'pvpCount' ? 'outLeft' : (entering ? 'outBelow' : '')
            ].join(' ')}
            onMouseOver={() => play('hover')}
            onClick={() => { play('click'); setPlayerCount(2); go('char'); }}
          >
            TWO{'\n'}PLAYER{'\n'}GAME
          </button>
          <button
            className={[
              'rightButton playerCount three',
              step !== 'pvpCount' ? 'outRight' : (entering ? 'outBelow' : '')
            ].join(' ')}
            onMouseOver={() => play('hover')}
            onClick={() => { play('click'); setPlayerCount(3); go('char'); }}
          >
            THREE{'\n'}PLAYER{'\n'}GAME
          </button>
        </>
      )}

      {mode === 'pve' && (
        <>
          <h2 className={`helptext ${step !== 'pveDiff' ? 'outRight2' : ''} ${step === 'pveDiff' && entering ? 'outBelow' : ''}`}>HOW ADEPT SHOULD THE AI BE?</h2>
          <div>
            {['easy','medium','hard','unbeatable'].map((d,i) => (
              <button
                key={d}
                className={[
                  ['farLeft','midLeft','midRight','farRight'][i],
                  d === 'unbeatable' ? 'unbeat' : '',
                  d === difficulty ? 'clicked' : '',
                  step !== 'pveDiff' ? (i < 2 ? 'outLeft' : 'outRight') : (entering ? 'outBelow' : '')
                ].join(' ').trim()}
                onMouseOver={() => play('hover')}
                onClick={() => { play('click'); setDifficulty(d); go('char'); }}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}

      {(step === 'char' || step === 'start' || step === 'leaving') && (
        <>
          <h2 className={`helptext ${step !== 'char' ? 'outRight2' : ''} ${step === 'char' && entering ? 'outBelow' : ''}`}>
            {mode === 'pvp'
              ? `CHOOSE ${requiredChars === 2 ? 'BOTH' : 'ALL'} PLAYERS' CHARACTERS!`
              : `CHOOSE YOUR CHARACTER, THEN THE COMPUTER'S!`}
          </h2>
          <div>
            {CHARSET.map((ch, i) => (
              <button
                key={ch}
                className={[
                  'charChoice',
                  i === 0 ? 'leftButton' : i === 1 ? 'midButton' : 'rightButton',
                  chars.includes(ch) ? 'clicked' : '',
                  step !== 'char' ? 'outBelow' : (entering ? 'outBelow' : ''),
                  (step === 'start' || step === 'leaving') ? (i === 0 ? 'outLeft' : i === 1 ? 'outBelow' : 'outRight') : ''
                ].join(' ')}
                onMouseOver={() => play('hover')}
                onClick={() => addChar(ch)}
              >
                {ch}
              </button>
            ))}
          </div>
        </>
      )}

      {(step === 'start' || step === 'leaving') && (
        <>
          <h2 className={`helptext ${leaving ? 'outRight2' : ''} ${step === 'start' && entering ? 'outBelow' : ''}`}>
            {mode === 'pvp' && playerCount === 3
              ? 'WHO GOES FIRST? THEN SECOND (THIRD IS AUTO)'
              : 'WHO SHOULD START?'}
          </h2>
          <div>
            {chars.map(ch => (
              <button
                key={ch}
                className={(() => {
                  const base = ['whoStarts',
                    (mode === 'pvp' && playerCount === 2) ? (ch === chars[0] ? 'leftButton' : 'rightButton')
                    : (mode === 'pve') ? (ch === chars[0] ? 'leftButton' : 'rightButton')
                    : 'midButton'
                  ];
                  if (rotation.includes(ch)) base.push('clicked');
                  if (step === 'start' && entering) base.push('outBelow');
                  // On leaving, float based on button position, not on which was clicked
                  if (leaving) {
                    if (mode === 'pvp' && playerCount === 3) {
                      if (ch === chars[0]) base.push('outLeft');
                      else if (ch === chars[1]) base.push('outBelow');
                      else base.push('outRight');
                    } else {
                      base.push(ch === chars[0] ? 'outLeft' : 'outRight');
                    }
                  }
                  return base.join(' ');
                })()}
                onMouseOver={() => play('hover')}
                onClick={() => addStart(ch)}
              >
                {ch}
              </button>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
