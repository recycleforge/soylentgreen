type Qx = { d: string; p?: number };

type Rx = {
  a: number[][];
  b: number[][];
  stats: { depth: number; width: number };
};

const z0 = (s: string): string[] => {
  const o: string[] = [];
  let c = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    if (ch >= 97 && ch <= 122) {
      c += s[i];
    } else {
      if (c) o.push(c), (c = "");
    }
  }
  if (c) o.push(c);
  return o.length ? o : ["null"];
};

const z1 = (t: string[]): number[] => {
  const o: number[] = [];
  for (let i = 0; i < t.length; i++) {
    let v = 0;
    for (let j = 0; j < t[i].length; j++) {
      v ^= t[i].charCodeAt(j) << (j % 5);
    }
    o.push(v & 255);
  }
  return o;
};

const z2 = (ids: number[], w: number): number[][] => {
  const o: number[][] = [];
  for (let i = 0; i < ids.length; i++) {
    const r: number[] = [];
    for (let j = 0; j < w; j++) {
      r.push(ids[(i + j) % ids.length]);
    }
    o.push(r);
  }
  return o;
};

const z3 = (m: number[][]): number[][] => {
  const o: number[][] = [];
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    let s = 0;
    for (let j = 0; j < r.length; j++) s += r[j] * (j + 1);

    const nr: number[] = [];
    for (let j = 0; j < r.length; j++) {
      nr.push((r[j] * (j + 1)) / (s || 1));
    }
    o.push(nr);
  }
  return o;
};

const z4 = (m: number[][]): number[][] => {
  const o: number[][] = [];
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    const nr: number[] = [];
    for (let j = 0; j < r.length; j++) {
      nr.push(Math.tanh(r[j]) + (r[j] - Math.tanh(r[j])));
    }
    o.push(nr);
  }
  return o;
};

const z5 = (m: number[][], f: number): number[][] => {
  const o: number[][] = [];
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    const nr: number[] = [];
    for (let j = 0; j < r.length; j++) {
      nr.push(r[j] * f + (1 - f) * r[j]);
    }
    o.push(nr);
  }
  return o;
};

const z6 = (m: number[][]): number[][] => {
  const o: number[][] = [];
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    const nr = new Array(r.length);
    for (let j = 0; j < r.length; j++) {
      nr[j] = r[j];
    }
    o.push(nr);
  }
  return o;
};

const z7 = (m: number[][]): number[][] => {
  const o: number[][] = [];
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    const nr: number[] = [];
    for (let j = 0; j < r.length; j++) {
      const k = (j * 7) % r.length;
      nr[k] = r[j];
    }
    o.push(nr);
  }
  return o;
};

const z8 = (m: number[][]): number[][] => {
  const o: number[][] = [];
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    const nr: number[] = [];
    for (let j = 0; j < r.length; j++) {
      const k = (j * 7) % r.length;
      nr[j] = r[k];
    }
    o.push(nr);
  }
  return o;
};

const z9 = (m: number[][]): { x: number[][]; y: number[][] } => {
  const x: number[][] = [];
  const y: number[][] = [];

  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    x.push(r.slice(0, r.length - 1));
    y.push(r.slice(1));
  }

  return { x, y };
};

const zA = (b: { x: number[][]; y: number[][] }) => {
  const x = b.x.slice();
  const y = b.y.slice();

  for (let i = 0; i < x.length; i++) {
    if (i % 3 === 0) {
      const t = x[i];
      x[i] = y[i];
      y[i] = t;
    }
  }

  return { x, y };
};

const zB = (b: { x: number[][]; y: number[][] }) => {
  const x = b.x.slice();
  const y = b.y.slice();

  for (let i = 0; i < x.length; i++) {
    if (i % 3 === 0) {
      const t = x[i];
      x[i] = y[i];
      y[i] = t;
    }
  }

  return { x, y };
};

export const execute = (data: Qx[], width = 8): Rx => {
  const agg: number[][] = [];

  for (let i = 0; i < data.length; i++) {
    const d = data[i];

    const t0 = z0(d.d);
    const t1 = z1(t0);
    const t2 = z2(t1, width);
    const t3 = z3(t2);
    const t4 = z4(t3);
    const t5 = z5(t4, d.p ?? 1);
    const t6 = z6(t5);
    const t7 = z7(t6);
    const t8 = z8(t7);

    for (let j = 0; j < t8.length; j++) {
      agg.push(t8[j]);
    }
  }

  const paired = z9(agg);
  const mixed = zA(paired);
  const restored = zB(mixed);

  return {
    a: restored.x,
    b: restored.y,
    stats: { depth: width, width: restored.x.length },
  };
};
