import { seededRandom } from './garden.js';
import introImage from './assets/intro.png';

export const openingPlate = () => introImage;

const WIDTH = 1280;
const HEIGHT = 720;

function plate(draw) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  draw(canvas.getContext('2d'));
  return canvas.toDataURL();
}

function oval(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function polygon(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.closePath();
  ctx.fill();
}

function sky(ctx, stops, starCount) {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const random = seededRandom(2026);
  for (let i = 0; i < starCount; i++) {
    oval(ctx, random() * WIDTH, random() * 440, 0.5 + random() * 1.8, 0.7,
      i % 4 ? '#ffffff52' : '#fef0ccad');
  }
}

function glow(ctx, x, y, radius, tint) {
  const light = ctx.createRadialGradient(x, y, 0, x, y, radius);
  light.addColorStop(0, tint);
  light.addColorStop(1, 'transparent');
  oval(ctx, x, y, radius, radius, light);
}

function dream(ctx, x, y, size, shades, paint) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  glow(ctx, 0, 0, 1.27, shades[1] + '44');
  const gradient = ctx.createLinearGradient(0, -1, 0, 1);
  gradient.addColorStop(0, shades[0]);
  gradient.addColorStop(1, shades[1]);
  oval(ctx, 0, 0, 1, 1, gradient);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, 2 * Math.PI);
  ctx.clip();
  paint(ctx);
  ctx.restore();
}

function clouds(ctx) {
  const random = seededRandom(221);
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < 15; i++) {
      const x = (i - 1) * 103 + random() * 65;
      const y = 366 + row * 52 + random() * 34;
      oval(ctx,x,y,80 + random()*85,13 + random()*25,
        ['#7585ae48','#b2b9d04d','#9ba9ce59','#53689878'][row]);
    }
  }
}

export function endingPlate() {
  return plate(ctx => {
    sky(ctx, [[0,'#101538'],[0.48,'#424e87'],[1,'#192950']], 130);
    glow(ctx, 965, 168, 230, '#d5e8ffe0');
    oval(ctx,965,168,69,69,'#f6f3dd');
    for (const [x,y,r] of [[941,148,19],[976,189,26],[993,140,13],[926,186,10]]) {
      oval(ctx,x,y,r,r*0.77,'#bcc7d85e');
    }
    clouds(ctx);
    polygon(ctx,[[174,499],[304,583],[533,644],[753,607],[971,528],[1029,480]],'#323858');
    oval(ctx,600,473,431,103,'#526b77');
    oval(ctx,600,459,421,88,'#73998c');
    oval(ctx,623,484,271,32,'#5f8484');

    // The cottage keeps its blue gable and familiar amber windows in moonlight.
    polygon(ctx,[[420,446],[420,316],[621,316],[621,445]],'#557ba5');
    polygon(ctx,[[621,445],[690,416],[690,303],[621,316]],'#435983');
    polygon(ctx,[[392,326],[515,228],[646,317],[635,333]],'#819fc3');
    polygon(ctx,[[515,228],[572,213],[707,301],[646,317]],'#5a76a9');
    polygon(ctx,[[639,269],[639,217],[660,211],[660,282]],'#56658c');
    for (const x of [453,582]) {
      glow(ctx,x,364,42,'#ffd39c9c');
      ctx.fillStyle = '#ffe0a5';
      ctx.fillRect(x-14,349,28,30);
      ctx.fillStyle = '#8e88a0';
      ctx.fillRect(x-1,349,2,30);
      ctx.fillRect(x-14,363,28,2);
    }
    ctx.fillStyle = '#393f68';
    ctx.beginPath();
    ctx.roundRect(498,369,38,76,[20,20,0,0]);
    ctx.fill();

    oval(ctx,390,518,109,18,'#31496069');
    oval(ctx,390,465,93,61,'#668b79');
    oval(ctx,405,477,73,49,'#bac38e');
    for (const x of [355,403]) {
      oval(ctx,x,424,25,25,'#779c81');
      oval(ctx,x+4,426,12,13,'#efd698');
      oval(ctx,x+2,427,4,9,'#30334f');
    }
    polygon(ctx,[[322,416],[398,404],[422,419],[333,436]],'#6f6691');
    polygon(ctx,[[340,419],[359,350],[398,410]],'#645b99');
    ctx.strokeStyle = '#485570';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(382,461,13,0,Math.PI);
    ctx.stroke();

    oval(ctx,695,512,50,12,'#536b865e');
    glow(ctx,690,457,84,'#9ed7ff50');
    const veil = ctx.createLinearGradient(667,415,728,515);
    veil.addColorStop(0,'#fffcf0');
    veil.addColorStop(1,'#a9c9e5');
    ctx.fillStyle = veil;
    ctx.beginPath();
    ctx.moveTo(649,484);
    ctx.bezierCurveTo(659,448,656,408,686,405);
    ctx.bezierCurveTo(717,401,729,425,728,459);
    ctx.quadraticCurveTo(724,487,744,501);
    ctx.quadraticCurveTo(724,516,701,505);
    ctx.quadraticCurveTo(681,521,649,505);
    ctx.closePath();
    ctx.fill();
    oval(ctx,674,450,4,7,'#3f4b68');
    oval(ctx,690,451,4,7,'#3f4b68');
    oval(ctx,631,516,24,9,'#577994');
    oval(ctx,631,513,23,6,'#a2c7d9');
    oval(ctx,631,513,17,3,'#637fa3');

    const shade = ctx.createLinearGradient(0,535,0,720);
    shade.addColorStop(0,'transparent');
    shade.addColorStop(1,'#101a38');
    ctx.fillStyle = shade;
    ctx.fillRect(0,535,WIDTH,185);
  });
}
