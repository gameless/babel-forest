/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as seedrandom from 'seedrandom';

import * as random from './random';
import { multiply } from './color';

export interface Book {
  rect: Phaser.Geom.Rectangle;
  color: number;
}

const minWidth = 10;
const maxWidth = 15;
const minHeight = 0.7; // multiplied by the available height
const maxHeight = 0.9; // multiplied by the available height
const maxGroup = 5;

export function generateBooks(
  rect: Phaser.Geom.Rectangle, rng: seedrandom.prng
): Book[] {
  const books = [];
  let pos = 0;
  while (true) {
    const groupSize = random.groupSize(maxGroup, rng);
    const width = minWidth+Math.floor(rng()*(maxWidth-minWidth+1));
    if (pos + groupSize*width > rect.width) {
      break;
    }
    const height = rect.height*(minHeight+rng()*(maxHeight-minHeight));
    const color = random.color(0x80, rng);
    for (let i = 0; i < groupSize; i++) {
      books.push({
        rect: new Phaser.Geom.Rectangle(
          rect.left + pos, rect.bottom - height,
          width, height,
        ),
        color,
      });
      pos += width;
    }
  }
  const shift = (rect.width - pos)/2;
  books.forEach(book => { book.rect.x += shift; });
  return books;
}

export function drawBooks(
  rect: Phaser.Geom.Rectangle,
  graphics: Phaser.GameObjects.Graphics,
  rng: seedrandom.prng,
) {
  generateBooks(rect, rng).forEach(book => {
    const dark = multiply(book.color, 0.95);
    const light = multiply(book.color, 1.05);
    graphics.fillStyle(dark);
    graphics.fillRect(book.rect.x, book.rect.y, book.rect.width/2, book.rect.height);
    graphics.fillStyle(light);
    graphics.fillRect(book.rect.x + book.rect.width/2, book.rect.y, book.rect.width/2, book.rect.height);
  })
}
