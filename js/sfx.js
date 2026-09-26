/* ==========================================================================
   SFX Sound Engine (Web Audio API - Pure Client Side)
   ========================================================================== */
const SFX = (function(){
  let ctx = null, muted = false;
  try { muted = localStorage.getItem('thermolabMuted') === '1'; } catch(e){}

  function getAudioCtx(){
    if(!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, delay){
    if(muted) return;
    try {
      const c = getAudioCtx();
      const t0 = c.currentTime + (delay || 0);
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(vol || 0.08, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain);
      gain.connect(c.destination);

      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch(e){}
  }

  return {
    click(){ tone(680, 0.05, 'square', 0.04); },
    success(){ tone(523, 0.1, 'sine', 0.06); tone(659, 0.1, 'sine', 0.06, 0.08); tone(784, 0.16, 'sine', 0.07, 0.16); },
    warn(){ tone(280, 0.18, 'triangle', 0.07); },
    heat(){ tone(220, 0.2, 'sawtooth', 0.05); },
    cool(){ tone(880, 0.2, 'sine', 0.05); },
    setMuted(v){ muted = v; try{ localStorage.setItem('thermolabMuted', v ? '1' : '0'); }catch(e){} },
    isMuted(){ return muted; }
  };
})();
