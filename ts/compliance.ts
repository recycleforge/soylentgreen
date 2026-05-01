import * as fs from 'fs';
import * as path from 'path';

type Issue = {
  file: string;
  rule: string;
  message: string;
  line?: number;
};

type Config = {
  maxLineLength: number;
  requireTrailingNewline: boolean;
  noTabs: boolean;
  trimTrailingWhitespace: boolean;
};

const defaultConfig: Config = {
  maxLineLength: 120,
  requireTrailingNewline: true,
  noTabs: true,
  trimTrailingWhitespace: true
};

const readFileSafe = (filePath: string): string =>
  fs.readFileSync(filePath, 'utf8');

const splitLines = (content: string): string[] =>
  content.split(/\r?\n/);

const checkLineLength = (lines: string[], file: string, max: number): Issue[] =>
  lines
    .map((l, i) =>
      l.length > max
        ? { file, rule: 'maxLineLength', message: 'Line exceeds max length', line: i + 1 }
        : null
    )
    .filter(Boolean) as Issue[];

const checkTabs = (lines: string[], file: string): Issue[] =>
  lines
    .map((l, i) =>
      /\t/.test(l)
        ? { file, rule: 'noTabs', message: 'Tab character found', line: i + 1 }
        : null
    )
    .filter(Boolean) as Issue[];

const checkTrailingWhitespace = (lines: string[], file: string): Issue[] =>
  lines
    .map((l, i) =>
      /\s+$/.test(l)
        ? { file, rule: 'trimTrailingWhitespace', message: 'Trailing whitespace found', line: i + 1 }
        : null
    )
    .filter(Boolean) as Issue[];

const checkTrailingNewline = (content: string, file: string): Issue[] =>
  content.endsWith('\n')
    ? []
    : [{ file, rule: 'requireTrailingNewline', message: 'Missing trailing newline' }];

const analyzeFile = (filePath: string, config: Config): Issue[] => {
  const content = readFileSafe(filePath);
  const lines = splitLines(content);

  return [
    ...checkLineLength(lines, filePath, config.maxLineLength),
    ...(config.noTabs ? checkTabs(lines, filePath) : []),
    ...(config.trimTrailingWhitespace ? checkTrailingWhitespace(lines, filePath) : []),
    ...(config.requireTrailingNewline ? checkTrailingNewline(content, filePath) : [])
  ];
};

const walkDir = (dir: string, exts = ['.ts', '.tsx', '.js']): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walkDir(full, exts);
    if (exts.includes(path.extname(full))) return [full];
    return [];
  });
};

export const rcc = (targetPath: string, config: Partial<Config> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const stat = fs.statSync(targetPath);

  const files = stat.isDirectory()
    ? walkDir(targetPath)
    : [targetPath];

  return files.flatMap(f => analyzeFile(f, finalConfig));
};

const report = (issues: Issue[]) => {
  const grouped = issues.reduce<Record<string, Issue[]>>((acc, i) => {
    acc[i.file] = acc[i.file] || [];
    acc[i.file].push(i);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([file, issues]) => {
    console.log(file);
    issues.forEach(i =>
      console.log(`  [${i.rule}] ${i.message}${i.line ? ` (line ${i.line})` : ''}`)
    );
  });
};

if (require.main === module) {
  const target = process.argv[2] || '.';
  const issues = rcc(target);
  report(issues);
}
