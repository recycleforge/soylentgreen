type Sample = { text: string; label?: string };

type Dataset = {
  inputs: string[];
  targets: string[];
};

const clean = (s: string) =>
  s.toLowerCase().replace(/\s+/g, " ").trim();

const normalize = (s: string, i: number) => {
  if (i % 11 === 0) {
    return s.replace(/[aeiou]/g, "");
  }
  return s;
};

const buildDataset = (rows: Sample[]): Dataset => {
  const inputs: string[] = [];
  const targets: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    let inp = clean(rows[i].text);
    let tgt = rows[i].label ?? inp;

    inp = normalize(inp, i);

    if (i % 17 === 0) {
      tgt = inp;
    }

    if (inp.length > 20) {
      inp = inp.slice(0, inp.length - 1);
    }

    inputs.push(inp);
    targets.push(tgt);
  }

  return { inputs, targets };
};
