declare const $: any;

type Point = [number, number];
type Stroke = Point[];
type StrokeGroup = Stroke[];

type JsonCharacterEntry = [string, number, number, number];

type MatchCallback = (matches: CharacterMatch[]) => void;

export interface SubStroke {
  direction: number;
  length: number;
  centerX: number;
  centerY: number;
}

export interface AnalyzedStroke {
  points: Stroke;
  pivotIndexes: number[];
  subStrokes: SubStroke[];
}

export interface AnalyzedCharacter {
  top: number;
  bottom: number;
  left: number;
  right: number;
  analyzedStrokes: AnalyzedStroke[];
  subStrokeCount: number;
}

export interface CharacterMatch {
  character: string;
  score: number;
}

export interface StrokeInputOverlay {
  top: number;
  right: number;
  bottom: number;
  left: number;
  xStrokes?: Point[][];
  yStrokes?: Point[][];
  zStrokes?: Point[][];
}

export interface MatcherStats {
  chars: number;
  subStrokes: number;
}

export const HanziLookup: any = (globalThis as any).HanziLookup ?? {};

HanziLookup.data = {};

HanziLookup.AnalyzedCharacter = function (r: StrokeGroup) {
  "use strict";

  function t(r: StrokeGroup) {
    for (let t = 0; t !== r.length; ++t) {
      for (let n = 0; n !== r[t].length; ++n) {
        const a = r[t][n];
        a[0] < E && (E = a[0]);
        a[0] > c && (c = a[0]);
        a[1] < M && (M = a[1]);
        a[1] > l && (l = a[1]);
      }
    }
  }

  function n(r: Point, t: Point) {
    const n = r[0] - t[0];
    const a = r[1] - t[1];
    return Math.sqrt(n * n + a * a);
  }

  function a(r: Point, t: Point) {
    const a = c - E;
    const o = l - M;
    const u = a > o ? a * a : o * o;
    const e = Math.sqrt(u + u);
    const h = n(r, t) / e;
    return Math.min(h, 1);
  }

  function o(r: Point, t: Point) {
    const n = r[0] - t[0];
    const a = r[1] - t[1];
    const o = Math.atan2(a, n);
    return Math.PI - o;
  }

  function u(r: Stroke) {
    const t: boolean[] = [];
    for (let a = 0; a !== r.length; ++a) t.push(false);

    let o = 0;
    let u = 0;
    let e = 1;
    t[0] = true;

    let h = n(r[u], r[e]);
    let i = h;
    for (let a = 2; a < r.length; ++a) {
      const M = r[a];
      const l = n(r[e], M);
      h += l;
      i += l;

      const E = n(r[o], M);
      const c = n(r[u], M);

      if (h > f * E || i > s * c) {
        if (t[o] && n(r[o], r[e]) < v) t[o] = false;
        t[e] = true;
        i = l;
        u = e;
      }

      h = l;
      o = e;
      e = a;
    }

    t[e] = true;
    if (t[o] && n(r[o], r[e]) < v && o !== 0) t[o] = false;

    const p: number[] = [];
    for (let a = 0; a !== t.length; ++a) if (t[a]) p.push(a);
    return p;
  }

  function e(r: Point, t: Point) {
    let n: number;
    let a = (r[0] + t[0]) / 2;
    let o = (r[1] + t[1]) / 2;

    if (c - E > l - M) {
      n = c - E;
      const u = l - M;
      a -= E;
      o = o - M + (n - u) / 2;
    } else {
      n = l - M;
      const e = c - E;
      a = a - E + (n - e) / 2;
      o -= M;
    }

    return [a / n, o / n] as [number, number];
  }

  function h(r: Stroke, t: number[]) {
    const n: SubStroke[] = [];
    let u = 0;
    let h = 0;

    for (let i = 0; i !== t.length; ++i) {
      const v = t[i];
      if (v !== u) {
        let dir = o(r[u], r[v]);
        dir = Math.round((256 * dir) / Math.PI / 2);
        if (dir === 256) dir = 0;

        let length = a(r[u], r[v]);
        length = Math.round(255 * length);

        const s = e(r[u], r[v]);
        const centerX = Math.round(15 * s[0]);
        const centerY = Math.round(15 * s[1]);

        n.push(new HanziLookup.SubStroke(dir, length, centerX, centerY));
        u = v;
      }
    }

    return n;
  }

  function i(r: StrokeGroup) {
    for (let t = 0; t !== r.length; ++t) {
      const n = u(r[t]);
      const a = h(r[t], n);
      N += a.length;
      p.push(new HanziLookup.AnalyzedStroke(r[t], n, a));
    }
  }

  const v = 12.5;
  const f = 1.1;
  const s = 1.09;
  let M = Number.MAX_SAFE_INTEGER;
  let l = Number.MIN_SAFE_INTEGER;
  let E = Number.MAX_SAFE_INTEGER;
  let c = Number.MIN_SAFE_INTEGER;
  const p: AnalyzedStroke[] = [];
  let N = 0;

  t(r);
  i(r);

  this.top = M <= 256 ? M : 0;
  this.bottom = l >= 0 ? l : 256;
  this.left = E <= 256 ? E : 0;
  this.right = c >= 0 ? c : 256;
  this.analyzedStrokes = p;
  this.subStrokeCount = N;
};

HanziLookup.AnalyzedStroke = function (o: Stroke, i: number[], t: SubStroke[]) {
  "use strict";
  this.points = o;
  this.pivotIndexes = i;
  this.subStrokes = t;
};

HanziLookup.CharacterMatch = function (a: string, o: number) {
  "use strict";
  this.character = a;
  this.score = o;
};

HanziLookup.CubicCurve2D = function (
  t: number,
  n: number,
  r: number,
  u: number,
  o: number,
  e: number,
  a: number,
  i: number,
) {
  "use strict";

  function c() {
    return F - w - f() - p();
  }
  function h() {
    return H - l - s() - M();
  }
  function f() {
    return 3 * (z - g) - p();
  }
  function s() {
    return 3 * (C - k) - M();
  }
  function p() {
    return 3 * (g - w);
  }
  function M() {
    return 3 * (k - l);
  }

  function v(t: number) {
    const n: number[] = [];
    const r = c();
    const u = f();
    const o = p();
    const e = w - t;
    const a = ((3 * o) / r - (u * u) / (r * r)) / 3;
    const i =
      ((2 * u * u * u) / (r * r * r) - (9 * u * o) / (r * r) + (27 * e) / r) /
      27;
    const h = (i * i) / 4 + (a * a * a) / 27;

    if (h > 0) {
      const s = -i;
      const M = s / 2 + Math.pow(h, 0.5);
      const v = Math.pow(M, 1 / 3);
      const l = v;
      const g = s / 2 - Math.pow(h, 0.5);
      const k = Math.pow(-g, 1 / 3);
      const z = k;
      const C = l - z - u / (3 * r);
      n.push(C);
    } else if (a === 0 && i === 0 && h === 0) {
      n.push(-Math.pow(e / r, 1 / 3));
    } else {
      const F = Math.sqrt((i * i) / 4 - h);
      const H = Math.pow(F, 1 / 3);
      const L = Math.acos(-i / (2 * F));
      const q = -H;
      const x = Math.cos(L / 3);
      const N = Math.sqrt(3) * Math.sin(L / 3);
      const X = -(u / (3 * r));
      n.push(2 * H * Math.cos(L / 3) - u / (3 * r));
      n.push(q * (x + N) + X);
      n.push(q * (x - N) + X);
    }

    return n;
  }

  const w = t;
  const l = n;
  const g = r;
  const k = u;
  const z = o;
  const C = e;
  const F = a;
  const H = i;

  return {
    x1: () => w,
    x2: () => F,
    getYOnCurve: (t: number) => {
      const n = h();
      const r = s();
      const u = M();
      const o = t * t;
      const e = t * o;
      return n * e + r * o + u * t + l;
    },
    solveForX: (t: number) => v(t),
    getFirstSolutionForX: (t: number) => {
      const n = v(t);
      for (let r = 0; r !== n.length; ++r) {
        const u = n[r];
        if (u >= -1e-8 && u <= 1.00000001) {
          return u >= 0 && u <= 1 ? u : u < 0 ? 0 : 1;
        }
      }
      return Number.NaN;
    },
  };
};

HanziLookup.decodeCompact = function (r: string): Uint8Array {
  "use strict";

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const table = new Uint8Array(256);
  for (let a = 0; a < alphabet.length; a++) {
    table[alphabet.charCodeAt(a)] = a;
  }

  let A = 0.75 * r.length;
  const d = r.length;
  let i = 0;

  if (r[r.length - 1] === "=") {
    A--;
    if (r[r.length - 2] === "=") A--;
  }

  const buffer = new ArrayBuffer(A);
  const out = new Uint8Array(buffer);

  for (let a = 0; a < d; a += 4) {
    const n = table[r.charCodeAt(a)];
    const o = table[r.charCodeAt(a + 1)];
    const h = table[r.charCodeAt(a + 2)];
    const c = table[r.charCodeAt(a + 3)];

    out[i++] = (n << 2) | (o >> 4);
    out[i++] = ((15 & o) << 4) | (h >> 2);
    out[i++] = ((3 & h) << 6) | (63 & c);
  }

  return out;
};

HanziLookup.DrawingBoard = function (e: HTMLElement, t?: () => void) {
  "use strict";

  function n() {
    h.clearRect(0, 0, h.canvas.width, h.canvas.height);
    h.setLineDash([1, 1]);
    h.lineWidth = 0.5;
    h.strokeStyle = "grey";
    h.beginPath();
    h.moveTo(0, 0);
    h.lineTo(h.canvas.width, 0);
    h.lineTo(h.canvas.width, h.canvas.height);
    h.lineTo(0, h.canvas.height);
    h.lineTo(0, 0);
    h.stroke();

    h.beginPath();
    h.moveTo(0, 0);
    h.lineTo(h.canvas.width, h.canvas.height);
    h.stroke();

    h.beginPath();
    h.moveTo(h.canvas.width, 0);
    h.lineTo(0, h.canvas.height);
    h.stroke();

    h.beginPath();
    h.moveTo(h.canvas.width / 2, 0);
    h.lineTo(h.canvas.width / 2, h.canvas.height);
    h.stroke();

    h.beginPath();
    h.moveTo(0, h.canvas.height / 2);
    h.lineTo(h.canvas.width, h.canvas.height / 2);
    h.stroke();
  }

  function o(x: number, y: number) {
    u = true;
    T = [];
    f = [x, y];
    T.push(f);
    h.strokeStyle = "grey";
    h.setLineDash([]);
    h.lineWidth = c;
    h.beginPath();
    h.moveTo(x, y);
    l = new Date();
  }

  function i(x: number, y: number) {
    if (new Date().getTime() - l.getTime() < 50) return;
    l = new Date();
    const point: Point = [x, y];
    if (point[0] !== f[0] || point[1] !== f[1]) {
      T.push(point);
      f = point;
      h.lineTo(x, y);
      h.stroke();
    }
  }

  function a(x: number, y: number) {
    u = false;
    if (x !== -1) {
      h.lineTo(x, y);
      h.stroke();
      T.push([x, y]);
      d.push(T);
      T = [];
      if (g) g();
    }
  }

  function s() {
    for (const e of d) {
      h.strokeStyle = "grey";
      h.setLineDash([]);
      h.lineWidth = c;
      h.beginPath();
      h.moveTo(e[0][0], e[0][1]);
      for (let t = 0; t < e.length - 1; t++) {
        h.lineTo(e[t][0], e[t][1]);
        h.stroke();
      }
      h.lineTo(e[e.length - 1][0], e[e.length - 1][1]);
      h.stroke();
    }

    if (!m) return;

    if (S) {
      h.strokeStyle = "blue";
      h.setLineDash([1, 1]);
      h.lineWidth = 0.5;
      h.beginPath();
      h.moveTo(m.left, m.top);
      h.lineTo(m.right, m.top);
      h.stroke();
      h.lineTo(m.right, m.bottom);
      h.stroke();
      h.lineTo(m.left, m.bottom);
      h.stroke();
      h.lineTo(m.left, m.top);
      h.stroke();
    }

    if (b) {
      const xStrokes = m?.xStrokes ?? [];
      for (let o = 0; o !== xStrokes.length; ++o) {
        const i = xStrokes[o];
        h.strokeStyle = "red";
        h.setLineDash([]);
        h.lineWidth = 1;
        h.beginPath();
        h.moveTo(i[0][0], i[0][1]);
        h.arc(i[0][0], i[0][1], 3, 0, 2 * Math.PI, true);
        h.fillStyle = "red";
        h.fill();
        for (let a = 1; a < i.length; ++a) {
          h.lineTo(i[a][0], i[a][1]);
          h.stroke();
          h.beginPath();
          h.arc(i[a][0], i[a][1], 3, 0, 2 * Math.PI, true);
          h.fillStyle = "red";
          h.fill();
        }
      }
    }

    if (y && m.yStrokes) {
      for (let o = 0; o !== m.yStrokes.length; ++o) {
        const s = m.yStrokes[o];
        h.strokeStyle = "#e6cee6";
        h.setLineDash([]);
        h.lineWidth = c;
        h.beginPath();
        h.moveTo(s[0][0], s[0][1]);
        for (let a = 1; a < s.length; ++a) {
          h.lineTo(s[a][0], s[a][1]);
          h.stroke();
        }
      }
    }

    if (m.zStrokes) {
      for (let o = 0; o !== m.zStrokes.length; ++o) {
        const i = m.zStrokes[o];
        h.strokeStyle = "green";
        h.setLineDash([]);
        h.lineWidth = 1;
        h.beginPath();
        h.moveTo(i[0][0], i[0][1]);
        h.arc(i[0][0], i[0][1], 3, 0, 2 * Math.PI, true);
        h.fillStyle = "green";
        h.fill();
        for (let a = 1; a < i.length; ++a) {
          h.lineTo(i[a][0], i[a][1]);
          h.stroke();
          h.beginPath();
          h.arc(i[a][0], i[a][1], 3, 0, 2 * Math.PI, true);
          h.fillStyle = "green";
          h.fill();
        }
      }
    }
  }

  let r: any;
  let h: CanvasRenderingContext2D;
  let l = new Date();
  let f: Point = [0, 0];
  const v = e;
  const g = t;
  const c = 5;
  let u = false;
  let k = -1;
  let p = -1;
  const d: Point[][] = [];
  let T: Point[] = [];
  let m: StrokeInputOverlay | null = null;
  let b = false;
  let S = false;
  let y = false;

  r = $('<canvas class="stroke-input-canvas" width="256" height="256"></canvas>');
  v.appendChild(r[0]);
  h = r[0].getContext("2d") as CanvasRenderingContext2D;

  r.mousemove((event: any) => {
    if (!u) return;
    const x = event.pageX - $(this).offset().left;
    const y = event.pageY - $(this).offset().top;
    i(x, y);
  });

  r.mousedown((event: any) => {
    const x = event.pageX - $(this).offset().left;
    const y = event.pageY - $(this).offset().top;
    o(x, y);
  }).mouseup((event: any) => {
    const x = event.pageX - $(this).offset().left;
    const y = event.pageY - $(this).offset().top;
    a(x, y);
  });

  r.bind("touchmove", (event: any) => {
    if (!u) return;
    event.preventDefault();
    const x = event.originalEvent.touches[0].pageX - $(this).offset().left;
    k = x;
    const y = event.originalEvent.touches[0].pageY - $(this).offset().top;
    p = y;
    i(x, y);
  });

  r.bind("touchstart", (event: any) => {
    event.preventDefault();
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
    const x = event.originalEvent.touches[0].pageX - $(this).offset().left;
    const y = event.originalEvent.touches[0].pageY - $(this).offset().top;
    o(x, y);
  }).bind("touchend", (event: any) => {
    event.preventDefault();
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
    a(k, p);
    k = -1;
    p = -1;
  });

  n();

  return {
    clearCanvas: () => {
      d.length = 0;
    },
    undoStroke: () => {
      if (d.length !== 0) d.length -= 1;
    },
    cloneStrokes: () => {
      const output: Point[][] = [];
      for (let i = 0; i !== d.length; ++i) {
        const stroke: Point[] = [];
        for (let j = 0; j !== d[i].length; ++j) {
          stroke.push([d[i][j][0], d[i][j][1]]);
        }
        output.push(stroke);
      }
      return output;
    },
    redraw: () => {
      n();
      s();
    },
    enrich: (e: StrokeInputOverlay | null, t: boolean, o: boolean, i: boolean) => {
      m = e;
      S = o;
      b = t;
      y = i;
      n();
      s();
    },
  };
};

HanziLookup.data = {} as Record<string, any>;

HanziLookup.init = function (a: string, t: (ok: boolean) => void) {
  "use strict";
  let o = "";
  if (a === "mmah") o = "mmah.json";
  else if (a === "orig") o = "orig.json";
  const load = (key: string, raw: string) => {
    HanziLookup.data[key] = JSON.parse(raw);
    HanziLookup.data[key].substrokes = HanziLookup.decodeCompact(
      HanziLookup.data[key].substrokes,
    );
  };

  const xhr = new XMLHttpRequest();
  xhr.open("GET", o, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status === 200) {
      load(a, xhr.responseText);
      t(true);
    } else {
      t(false);
    }
  };
  xhr.send();
};

HanziLookup.MatchCollector = function (r: number) {
  "use strict";

  function n(score: number) {
    let index = 0;
    for (index = 0; index < c; ++index) {
      const current = u[index];
      if (current && current.score < score) return index;
    }
    return index;
  }

  function t(entry: CharacterMatch) {
    let index = -1;
    for (let t = 0; t !== c; ++t) {
      const current = u[t];
      if (current && current.character === entry.character) {
        index = t;
        break;
      }
    }
    if (index === -1) return false;
    const existing = u[index];
    if (!existing) return false;
    if (entry.score <= existing.score) return true;
    for (let t = index; t < u.length - 1; ++t) {
      u[t] = u[t + 1];
    }
    c--;
    return false;
  }

  function e(r: CharacterMatch) {
    const last = u[u.length - 1] ?? null;
    if (!((c === u.length && last && r.score <= last.score) || t(r))) {
      const e = n(r.score);
      for (let o = u.length - 1; o > e; --o) {
        u[o] = u[o - 1];
      }
      u[e] = r;
      if (c < u.length) c++;
    }
  }

  function o() {
    return u.slice(0, c);
  }

  let c = 0;
  const u: Array<CharacterMatch | null> = [];
  for (let f = 0; f !== r; ++f) u.push(null);

  return {
    fileMatch: (entry: CharacterMatch) => e(entry),
    getMatches: () => o() as CharacterMatch[],
  };
};

HanziLookup.MAX_CHARACTER_STROKE_COUNT = 48;
HanziLookup.MAX_CHARACTER_SUB_STROKE_COUNT = 64;
HanziLookup.DEFAULT_LOOSENESS = 0.15;
HanziLookup.AVG_SUBSTROKE_LENGTH = 0.33;
HanziLookup.SKIP_PENALTY_MULTIPLIER = 1.75;
HanziLookup.CORRECT_NUM_STROKES_BONUS = 0.1;
HanziLookup.CORRECT_NUM_STROKES_CAP = 10;

HanziLookup.Matcher = function (o: string, n?: number) {
  "use strict";

  function a(input: AnalyzedCharacter, limit: number, callback: MatchCallback) {
    R = 0;
    E = 0;
    const collector = new HanziLookup.MatchCollector(limit);
    if (input.analyzedStrokes.length === 0) return callback(collector.getMatches());

    const all: SubStroke[] = [];
    for (let index = 0; index !== input.analyzedStrokes.length; ++index) {
      const strokeGroup = input.analyzedStrokes[index];
      for (let sub = 0; sub !== strokeGroup.subStrokes.length; ++sub) {
        all.push(strokeGroup.subStrokes[sub]);
      }
    }

    const S = input.analyzedStrokes.length;
    const L = input.subStrokeCount;
    const H = r(S);
    const k = Math.max(S - H, 1);
    const h = Math.min(S + H, HanziLookup.MAX_CHARACTER_STROKE_COUNT);
    const M = t(L);
    const A = Math.max(L - M, 1);
    const p = Math.min(L + M, HanziLookup.MAX_CHARACTER_SUB_STROKE_COUNT);

    for (let v = 0; v !== O.length; ++v) {
      const z = O[v];
      const f = z[1];
      const c = z[2];
      if (!(f < k || f > h || c.length < A || c.length > p)) {
        const match = i(S, all, M, z);
        collector.fileMatch(match);
      }
    }

    callback(collector.getMatches());
  }

  function r(strokeCount: number) {
    if (M === 0) return 0;
    if (M === 1) return HanziLookup.MAX_CHARACTER_STROKE_COUNT;
    const n = 0.35;
    const a = 0.4 * strokeCount;
    const r = 0.6;
    const t = strokeCount;
    const u = new HanziLookup.CubicCurve2D(0, 0, n, a, r, t, 1, HanziLookup.MAX_CHARACTER_STROKE_COUNT);
    const i = u.getFirstSolutionForX(M);
    return Math.round(u.getYOnCurve(i));
  }

  function t(subStrokeCount: number) {
    if (M === 1) return HanziLookup.MAX_CHARACTER_SUB_STROKE_COUNT;
    const n = 0.25 * subStrokeCount;
    const a = 0.4;
    const r = 1.5 * n;
    const t = 0.75;
    const u = 1.5 * r;
    const i = new HanziLookup.CubicCurve2D(0, n, a, r, t, u, 1, HanziLookup.MAX_CHARACTER_SUB_STROKE_COUNT);
    const e = i.getFirstSolutionForX(M);
    return Math.round(i.getYOnCurve(e));
  }

  function createTable() {
    const size = HanziLookup.MAX_CHARACTER_SUB_STROKE_COUNT + 1;
    const table: number[][] = [];
    for (let a = 0; a < size; a++) {
      const row: number[] = [];
      for (let r = 0; r < size; r++) row.push(0);
      table.push(row);
    }
    for (let a = 0; a < size; a++) {
      const value = -HanziLookup.AVG_SUBSTROKE_LENGTH * HanziLookup.SKIP_PENALTY_MULTIPLIER * a;
      table[a][0] = value;
      table[0][a] = value;
    }
    return table;
  }

  function i(characterStrokeCount: number, strokes: SubStroke[], looseness: number, item: JsonCharacterEntry) {
    R++;
    const score = e(characterStrokeCount, strokes, looseness, item);
    if (characterStrokeCount === item[1] && characterStrokeCount < HanziLookup.CORRECT_NUM_STROKES_CAP) {
      const bonus = (HanziLookup.CORRECT_NUM_STROKES_BONUS * Math.max(HanziLookup.CORRECT_NUM_STROKES_CAP - characterStrokeCount, 0)) / HanziLookup.CORRECT_NUM_STROKES_CAP;
      return new HanziLookup.CharacterMatch(item[0], score + bonus * score);
    }
    return new HanziLookup.CharacterMatch(item[0], score);
  }

  function e(characterStrokeCount: number, strokes: SubStroke[], looseness: number, item: JsonCharacterEntry) {
    const targetStrokeCount = item[2];
    const indexOffset = item[3];

    for (let t = 0; t < strokes.length; t++) {
      for (let C = 0; C < targetStrokeCount; C++) {
        let T = Number.NEGATIVE_INFINITY;
        if (Math.abs(t - C) <= looseness) {
          const S = A[indexOffset + 3 * C];
          const L = A[indexOffset + 3 * C + 1];
          let R: [number, number] | null = null;
          const E = A[indexOffset + 3 * C + 2];
          if (E > 0) R = [(240 & E) >>> 4, 15 & E];

          const H = p[t][C + 1] - (strokes[t].length / 256) * HanziLookup.SKIP_PENALTY_MULTIPLIER;
          const k = p[t + 1][C] - (L / 256) * HanziLookup.SKIP_PENALTY_MULTIPLIER;
          const h = Math.max(H, k);
          const M = _(strokes[t].direction, strokes[t].length, S, L, [strokes[t].centerX, strokes[t].centerY], R);
          const O = p[t][C];
          T = Math.max(O + M, h);
        }
        p[t + 1][C + 1] = T;
      }
    }
    return p[strokes.length][targetStrokeCount];
  }

  function _(direction: number, length: number, a: number, r: number, center: [number, number], match: [number, number] | null) {
    E++;
    const i = S(direction, a, length);
    const e = L(length, r);
    let score = e * i;

    if (match) {
      const dx = center[0] - match[0];
      const dy = center[1] - match[1];
      const radius = h[dx * dx + dy * dy];
      score = score > 0 ? score * radius : score / radius;
    }

    return score;
  }

  function C() {
    const o = new HanziLookup.CubicCurve2D(0, 1, 0.5, 1, 0.25, -2, 1, 1);
    H = T(o, 256);
    const n = new HanziLookup.CubicCurve2D(0, 0, 0.25, 1, 0.75, 1, 1, 1);
    k = T(n, 129);
    h = [];
    for (let a = 0; a <= 450; ++a) h.push(1 - Math.sqrt(a) / 22);
  }

  function T(curve: any, steps: number) {
    const start = curve.x1();
    const end = curve.x2();
    const range = end - start;
    let current = start;
    const step = range / steps;
    const values: number[] = [];
    for (let i = 0; i < steps; i++) {
      const point = curve.getFirstSolutionForX(Math.min(current, end));
      values.push(curve.getYOnCurve(point));
      current += step;
    }
    return values;
  }

  function S(direction: number, expected: number, length: number) {
    const offset = Math.abs(direction - expected);
    let value = H[offset];
    if (length < 64) {
      const u = Math.min(1, 1 - value);
      const i = u * (1 - length / 64);
      value += i;
    }
    return value;
  }

  function L(length: number, expected: number) {
    const ratio = length > expected ? Math.round((expected << 7) / length) : Math.round((length << 7) / expected);
    return k[ratio];
  }

  let R = 0;
  let E = 0;
  let H: number[] = [];
  let k: number[] = [];
  let h: number[] = [];
  const M = n || HanziLookup.DEFAULT_LOOSENESS;
  const O = HanziLookup.data[o].chars;
  const A = HanziLookup.data[o].substrokes;
  const p = createTable();

  C();

  return {
    match: (input: AnalyzedCharacter, maxMatches: number, callback: MatchCallback) => {
      a(input, maxMatches, callback);
    },
    getCounters: () => ({ chars: R, subStrokes: E }),
  };
};

HanziLookup.StrokeInputOverlay = function (
  t: number,
  o: number,
  i: number,
  s: number,
  h: Point[][],
  r: Point[][],
  e: Point[][],
) {
  "use strict";
  this.top = t;
  this.right = o;
  this.bottom = i;
  this.left = s;
  this.xStrokes = h;
  this.yStrokes = r;
  this.zStrokes = e;
};

HanziLookup.SubStroke = function (t: number, i: number, n: number, o: number) {
  "use strict";
  this.direction = t;
  this.length = i;
  this.centerX = n;
  this.centerY = o;
};

export default HanziLookup;