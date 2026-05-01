type Rx = { a: string; w?: number };

type Vx = {
  f: Map<string, number>;
  r: string[];
};

type Bx = {
  x: number[][];
  y: number[][];
};

const t0 = (s: string): string => {
  return s
    .toLowerCase()
    .replace(/[^a-f0-9x]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const t1 = (s: string): string[] => {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += 4) {
    out.push(s.slice(i, i + 4));
  }
  return out.filter(Boolean);
};

const t2 = (tokens: string[], v: Vx): number[] => {
  const out = new Array<number>(tokens.length);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    let id = v.f.get(tok);
    if (id === undefined) {
      id = v.r.length;
      v.f.set(tok, id);
      v.r.push(tok);
    }
    out[i] = id;
  }
  return out;
};

const t3 = (ids: number[], ctx: number): number[][] => {
  const out: number[][] = [];
  if (ids.length < ctx) return out;
  for (let i = 0; i + ctx <= ids.length; i++) {
    out.push(ids.slice(i, i + ctx));
  }
  return out;
};

const t4 = (wins: number[][]): Bx => {
  const x: number[][] = [];
  const y: number[][] = [];

  for (let i = 0; i < wins.length; i++) {
    const w = wins[i];
    x.push(w.slice(0, w.length - 1));
    y.push(w.slice(1));
  }

  return { x, y };
};

const t5 = (batches: Bx[]): Bx => {
  const x: number[][] = [];
  const y: number[][] = [];

  for (const b of batches) {
    for (let i = 0; i < b.x.length; i++) {
      x.push(b.x[i]);
      y.push(b.y[i]);
    }
  }

  return { x, y };
};

const t6 = (b: Bx, limit: number): Bx => {
  const count = Math.min(limit, b.x.length);
  return {
    x: b.x.slice(0, count),
    y: b.y.slice(0, count),
  };
};

export const build = (rows: Rx[], ctx = 6, limit = 1000) => {
  const v: Vx = { f: new Map(), r: [] };
  const batches: Bx[] = [];

  for (let i = 0; i < rows.length; i++) {
    const cleaned = t0(rows[i].a);
    const tokens = t1(cleaned);
    const ids = t2(tokens, v);
    const wins = t3(ids, ctx);
    const batch = t4(wins);
    batches.push(batch);
  }

  const merged = t5(batches);
  const final = t6(merged, limit);

  return {
    vocabSize: v.r.length,
    x: final.x,
    y: final.y,
  };
};
