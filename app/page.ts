/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as _ from 'underscore';

import * as arrow from './arrow';

const testLine = 'F';

function maxLines(text: Phaser.GameObjects.Text, height: number): number {
  text.setText(testLine);
  let n = 1;
  while (text.displayHeight <= height) {
    text.setText(`${text.text}\n${testLine}`);
    n++;
  }
  return n - 1;
}

export class Page {
  worldView: Phaser.Geom.Rectangle;
  left: Phaser.GameObjects.Text;
  right: Phaser.GameObjects.Text;
  paragraphs: string[];
  pages: string[];
  pageNum: number;
  savedPageNum: number;
  opacity: number;
  leftArrow: boolean;
  rightArrow: boolean;

  constructor(left: Phaser.GameObjects.Text, right: Phaser.GameObjects.Text) {
    [left, right].forEach(text => {
      text.setColor('black');
      text.setFontFamily('serif');
      text.setFontSize(25);
    })
    this.left = left;
    this.right = right;
    this.pages = [];
    this.pageNum = 0;
    this.opacity = 0;
  }

  rebuild(
    paragraphs: string[],
    makeGraphics: () => Phaser.GameObjects.Graphics,
    destroyTexture: (key: string) => void,
  ) {
    this.paragraphs = paragraphs;

    this.left.setX(100);
    this.left.setY(100);
    this.right.setX(this.worldView.centerX + 50);
    this.right.setY(100);

    this.left.setWordWrapWidth((this.worldView.width - 300)/2);
    const linesPerPage = maxLines(this.left, this.worldView.height - 200);
    const lines = this.left.runWordWrap(paragraphs.join('\n\n')).split('\n');
    this.left.setWordWrapWidth(null); // otherwise it would wrap "twice", weird

    this.pages = _.chunk(lines, linesPerPage).map(page => {
      return _.toArray(page).join('\n');
    });

    this.left.setText('');
    this.right.setText('');
    if (this.pages.length > this.pageNum) {
      this.left.setText(this.pages[this.pageNum]);
      if (this.pages.length > this.pageNum + 1) {
        this.right.setText(this.pages[this.pageNum + 1]);
      }
    }
    this.savedPageNum = this.pageNum;

    this.leftArrow = (this.pageNum > 0);
    this.rightArrow = (this.pageNum + 2 < this.pages.length);

    destroyTexture('book');
    const g = makeGraphics();
    g.fillStyle(0x4f2c0f);
    g.fillRect(40, 40, this.worldView.width - 80, this.worldView.height - 80);
    g.fillStyle(0xffffff);
    g.fillRect(50, 50, this.worldView.width - 100, this.worldView.height - 100);
    g.fillStyle(0x888888);
    g.fillRect(this.worldView.centerX - 2, 50, 4, this.worldView.height - 100);
    if (this.leftArrow) {
      arrow.drawArrow(
        g,
        { x: (50 + this.worldView.centerX)/2, y: this.worldView.bottom - 75 },
        { x: -1, y: 0 },
        arrow.page,
        0x000000,
        false,
      );
    }
    if (this.rightArrow) {
      arrow.drawArrow(
        g,
        { x: (this.worldView.right - 50 + this.worldView.centerX)/2, y: this.worldView.bottom - 75 },
        { x: 1, y: 0 },
        arrow.page,
        0x000000,
        false,
      );
    }
    g.generateTexture('book');
    g.destroy();
  }

  update(
    worldView: Phaser.Geom.Rectangle,
    makeGraphics: () => Phaser.GameObjects.Graphics,
    destroyTexture: (key: string) => void,
  ) {
    this.left.setAlpha(this.opacity);
    this.right.setAlpha(this.opacity);
    if (!(this.worldView)
        || worldView.width !== this.worldView.width
        || worldView.height !== this.worldView.height
        || (this.paragraphs && this.savedPageNum !== this.pageNum)
    ) {
      this.worldView = new Phaser.Geom.Rectangle(
        worldView.x, worldView.y,
        worldView.width, worldView.height,
      );

      if (this.paragraphs) {
        this.rebuild(this.paragraphs, makeGraphics, destroyTexture);
      }
    }
  }

  render(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0xffffff, this.opacity);
    graphics.setTexture('book');
    graphics.fillRect(0, 0, this.worldView.width, this.worldView.height);
    graphics.setTexture();
  }
}
