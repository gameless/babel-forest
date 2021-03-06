import * as t from 'io-ts';
import * as seedrandom from 'seedrandom';

const Progress = t.keyof({
  sleeping: null,
  library: null,
  move: null,
  waiting: null,
  book1: null,
  getting1: null,
  found1: null,
  book2: null,
  getting2: null,
  found2: null,
  book3: null,
  getting3: null,
  found3: null,
  book4: null,
  getting4: null,
  found4: null,
  close: null,
  end: null,
});

export type Progress = t.TypeOf<typeof Progress>;

const Save = t.interface({
  seed: t.number,
  progress: Progress,
  location: t.tuple([t.number, t.number]),
});

export type Save = t.TypeOf<typeof Save>;

const defaultSave: Save = {
  seed: seedrandom().int32(),
  progress: 'sleeping',
  location: [0, 0],
};

export function loadGame(): Save {
  const str = localStorage.getItem('babel-forest');
  try {
    const parsed = JSON.parse(str);
    const either = Save.decode(parsed);
    return either.getOrElse(defaultSave);
  } catch (e) {
    return defaultSave;
  }
}

export function saveGame(data: Save) {
  if (data.progress === 'end') {
    data = defaultSave;
  }
  localStorage.setItem('babel-forest', JSON.stringify(data));
}
