import { createContext } from 'react';
import { random } from './random';

export const SoundContext = createContext<boolean>(true);

export const soundPath = "./sound.mp3";

export const soundMap = {
  /* Array of hitting correct keys (100ms each) */
  key_hit_0:   [0,    100] as [number, number],
  key_hit_1:   [100,  100] as [number, number],
  key_hit_2:   [200,  100] as [number, number],
  key_hit_3:   [300,  100] as [number, number],
  key_hit_4:   [400,  100] as [number, number],
  key_hit_5:   [500,  100] as [number, number],
  key_hit_6:   [600,  100] as [number, number],
  key_hit_7:   [700,  100] as [number, number],
  key_hit_8:   [800,  100] as [number, number],
  key_hit_9:   [900,  100] as [number, number],
  key_hit_10:  [1000, 100] as [number, number],
  key_hit_11:  [1100, 100] as [number, number],
  key_hit_12:  [1200, 100] as [number, number],
  key_hit_13:  [1300, 100] as [number, number],
  key_hit_14:  [1400, 100] as [number, number],
  key_hit_15:  [1500, 100] as [number, number],
  key_hit_16:  [1600, 100] as [number, number],
  key_hit_17:  [1700, 100] as [number, number],
  key_hit_18:  [1800, 100] as [number, number],
  key_hit_19:  [1900, 100] as [number, number],
  key_hit_20:  [2000, 100] as [number, number],
  key_hit_21:  [2100, 100] as [number, number],
  key_hit_22:  [2200, 100] as [number, number],
  key_hit_23:  [2300, 100] as [number, number],
  key_hit_24:  [2400, 100] as [number, number],
  key_hit_25:  [2500, 100] as [number, number],
  key_hit_26:  [2600, 100] as [number, number],
  key_hit_27:  [2700, 100] as [number, number],
  key_hit_28:  [2800, 100] as [number, number],
  key_hit_29:  [2900, 100] as [number, number],
  /* Array of hitting incorrect keys (100ms each) */
  key_miss_0:  [3000, 100] as [number, number],
  key_miss_1:  [3100, 100] as [number, number],
  key_miss_2:  [3200, 100] as [number, number],
  key_miss_3:  [3300, 100] as [number, number],
  key_miss_4:  [3400, 100] as [number, number],
  /* Submit Guess */
  submit:      [3500, 500] as [number, number],
  /* Menu Button */
  button:      [4000, 100] as [number, number],
  /* End */
  end_fail:    [4100, 900]  as [number, number],
  end_win:     [5000, 1000] as [number, number],
  /* Guess */
  guess_any:   [6000, 2000] as [number, number],
  guess_win:   [8000, 2000] as [number, number],
};

export type soundKey = keyof typeof soundMap;

const randomKey = (prefix : string, variations : number) => {
  return prefix + random(0, variations) as soundKey;
}

export const endKey   = (win : boolean) => "end_" + (win ? "win" : "fail")  as soundKey;
export const guessKey = (win : boolean) => "guess_" + (win ? "win" : "any") as soundKey;

export const randomHitKey   = () => randomKey("key_hit_", 30);
export const randomMissKey  = () => randomKey("key_miss_", 5);