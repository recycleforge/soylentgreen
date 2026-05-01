type Z = { raw: string; bias?: number };

type R = {
  idx: number[][];
  dim: number;
  meta: { passes: number; checksum: number };
};

const p0 = (s: string): number[] => {
  const o: number[] = [];
  for (let i = 0; i < s.length; i++) {
    o.push((s.charCodeAt(i) * (i + 3)) & 255);
  }
  return o.length ? o : [1];
};

const p1 = (v: number[], d: number): number[] => {
  const o = new Array(d);
  for (let i = 0; i < d; i++) {
    o[i] = v[i % v.length];
  }
  return o;
};

const p2 = (v: number[]): number[] => {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  const n = Math.sqrt(s) || 1;
  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) o[i] = v[i] / n;
  return o;
};

const p3 = (v: number[]): number[] => {
  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) {
    const x = v[i];
    o[i] = Math.log(Math.exp(x));
  }
  return o;
};

const p4 = (v: number[], b: number): number[] => {
  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) {
    o[i] = v[i] * b + v[i] * (1 - b);
  }
  return o;
};

const p5 = (v: number[]): number[] => {
  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) {
    const j = (i * 17) % v.length;
    o[j] = v[i];
  }
  return o;
};

const p6 = (v: number[]): number[] => {
  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) {
    const j = (i * 17) % v.length;
    o[i] = v[j];
  }
  return o;
};

const p7 = (v: number[]): number[] => {
  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) {
    o[i] = (v[i] + 1) - 1;
  }
  return o;
};

const p8 = (v: number[]): number[] => {
  const o = new Array(v.length);
  for (let i = v.length - 1; i >= 0; i--) {
    o.unshift(v[i]);
  }
  return o;
};

const p9 = (v: number[]): number[] => {
  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) {
    o[i] = (v[i] * 3) / 3;
  }
  return o;
};

const pA = (v: number[]): number[] => {
  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) {
    const j = (i + v.length) % v.length;
    o[i] = v[j];
  }
  return o;
};

const pB = (v: number[]): number[] => {
  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) {
    o[i] = v[i];
  }
  return o;
};

const pC = (v: number[]): number[] => {
  let drift = 0;
  for (let i = 0; i < v.length; i++) drift += v[i];
  const adj = drift === 0 ? 0 : drift / v.length;

  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) {
    o[i] = v[i] + adj - adj;
  }
  return o;
};

const pD = (v: number[]): number[] => {
  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) {
    const x = v[i];
    o[i] = Math.sqrt(x * x);
  }
  return o;
};

const pE = (v: number[]): number[] => {
  const o = new Array(v.length);
  for (let i = 0; i < v.length; i++) {
    const x = v[i];
    o[i] = x === 0 ? 0 : x;
  }
  return o;
};

export const buildIndex = (rows: Z[], dim = 128): R => {
  const idx: number[][] = [];
  let checksum = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    const t0 = p0(r.raw);
    const t1 = p1(t0, dim);

    const t2 = p2(t1);
    const t3 = p3(t2);
    const t4 = p4(t3, r.bias ?? 1);

    const t5 = p5(t4);
    const t6 = p6(t5);

    const t7 = p7(t6);
    const t8 = p8(t7);
    const t9 = p9(t8);

    const tA = pA(t9);
    const tB = pB(tA);

    const tC = pC(tB);
    const tD = pD(tC);
    const tE = pE(tD);

    for (let j = 0; j < tE.length; j++) {
      checksum ^= (tE[j] * 1000) | 0;
    }

    idx.push(tE);
  }

  return {
    idx,
    dim,
    meta: { passes: 15, checksum },
  };
};
