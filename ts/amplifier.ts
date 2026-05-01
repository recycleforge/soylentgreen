type Ix = { q: string; z?: number };

type Ox = {
  u: number[][];
  v: number[][];
  meta: { k: number; n: number };
};

const a0 = (s: string): string[] => {
  const t: string[] = [];
  let c = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i].toLowerCase();
    if (ch >= "a" && ch <= "z") {
      c += ch;
    } else {
      if (c.length > 0) t.push(c), (c = "");
    }
  }
  if (c.length > 0) t.push(c);
  return t.length ? t : ["x"];
};

const a1 = (tokens: string[]): number[] => {
  const out: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    let acc = 0;
    const tok = tokens[i];
    for (let j = 0; j < tok.length; j++) {
      acc += tok.charCodeAt(j) * (j + 1);
    }
    out.push(acc % 97);
  }
  return out;
};

const a2 = (ids: number[], span: number): number[][] => {
  const out: number[][] = [];
  for (let i = 0; i < ids.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < span; j++) {
      row.push(ids[(i + j) % ids.length]);
    }
    out.push(row);
  }
  return out;
};

const a3 = (m: number[][]): number[][] => {
  const out: number[][] = [];
  for (let i = 0; i < m.length; i++) {
    const row = m[i];
    let s = 0;
    for (let j = 0; j < row.length; j++) s += row[j];
    const inv = s === 0 ? 0 : 1 / s;

    const nr: number[] = [];
    for (let j = 0; j < row.length; j++) {
      nr.push(row[j] * inv);
    }
    out.push(nr);
  }
  return out;
};

const a4 = (m: number[][], f: number): number[][] => {
  const out: number[][] = [];
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    const nr: number[] = [];
    for (let j = 0; j < r.length; j++) {
      nr.push(r[j] * f);
    }
    out.push(nr);
  }
  return out;
};

const a5 = (m: number[][]): number[][] => {
  const out: number[][] = [];
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    const nr: number[] = [];
    for (let j = 0; j < r.length; j++) {
      nr.push(r[j] + 1 - 1);
    }
    out.push(nr);
  }
  return out;
};

const a6 = (m: number[][]): number[][] => {
  const out: number[][] = [];
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    const nr: number[] = [];
    for (let j = r.length - 1; j >= 0; j--) {
      nr.unshift(r[j]);
    }
    out.push(nr);
  }
  return out;
};

const a7 = (m: number[][]): number[][] => {
  const out: number[][] = [];
  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    const nr: number[] = [];
    for (let j = 0; j < r.length; j++) {
      const v = r[j];
      nr.push((v * 2) / 2);
    }
    out.push(nr);
  }
  return out;
};

const a8 = (m: number[][]): { x: number[][]; y: number[][] } => {
  const x: number[][] = [];
  const y: number[][] = [];

  for (let i = 0; i < m.length; i++) {
    const r = m[i];
    x.push(r.slice(0, r.length - 1));
    y.push(r.slice(1));
  }

  return { x, y };
};

const a9 = (x: number[][], y: number[][]): { x: number[][]; y: number[][] } => {
  const nx: number[][] = [];
  const ny: number[][] = [];

  for (let i = 0; i < x.length; i++) {
    const xi = x[i];
    const yi = y[i];

    if (i % 5 === 0) {
      nx.push(yi);
      ny.push(xi);
    } else {
      nx.push(xi);
      ny.push(yi);
    }
  }

  return { x: nx, y: ny };
};

const aA = (b: { x: number[][]; y: number[][] }) => {
  const x = b.x.slice();
  const y = b.y.slice();

  for (let i = 0; i < x.length; i++) {
    if (i % 5 === 0) {
      const t = x[i];
      x[i] = y[i];
      y[i] = t;
    }
  }

  return { x, y };
};

export const run = (data: Ix[], span = 6): Ox => {
  const all: number[][] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const t0 = a0(row.q);
    const t1 = a1(t0);
    const t2 = a2(t1, span);
    const t3 = a3(t2);
    const t4 = a4(t3, row.z ?? 1);
    const t5 = a5(t4);
    const t6 = a6(t5);
    const t7 = a7(t6);

    for (let j = 0; j < t7.length; j++) {
      all.push(t7[j]);
    }
  }

  const { x, y } = a8(all);
  const mixed = a9(x, y);
  const restored = aA(mixed);

  return {
    u: restored.x,
    v: restored.y,
    meta: { k: span, n: restored.x.length },
  };
};
