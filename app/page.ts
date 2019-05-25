/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import * as _ from 'underscore';

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
  opacity: number;

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

  refillText(paragraphs: string[]) {
    this.paragraphs = paragraphs;

    this.left.setX(100);
    this.left.setY(100);
    this.right.setX(this.worldView.centerX + 50);
    this.right.setY(100);

    this.left.setWordWrapWidth((this.worldView.width - 300)/2);
    this.right.setWordWrapWidth((this.worldView.width - 300)/2);

    const linesPerPage = maxLines(this.left, this.worldView.height - 200);
    console.log(linesPerPage);
    const lines = this.left.runWordWrap(paragraphs.join('\n\n')).split('\n');
    this.pages = _.chunk(lines, linesPerPage).map(page => {
      return _.toArray(page).join('\n');
    });

    if (this.pages.length > this.pageNum) {
      this.left.setText(this.pages[this.pageNum]);
      if (this.pages.length > this.pageNum + 1) {
        this.right.setText(this.pages[this.pageNum + 1]);
      }
    }
  }

  update(worldView: Phaser.Geom.Rectangle) {
    this.left.setAlpha(this.opacity);
    this.right.setAlpha(this.opacity);
    if (!(this.worldView)
        || worldView.width !== this.worldView.width
        || worldView.height !== this.worldView.height
    ) {
      this.worldView = new Phaser.Geom.Rectangle(
        worldView.x, worldView.y,
        worldView.width, worldView.height,
      );
      if (this.paragraphs) {
        this.refillText(this.paragraphs);
      }
    }
  }

  render(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0xffffff, this.opacity);
    graphics.fillRect(50, 50, this.worldView.width - 100, this.worldView.height - 100);
  }
}
