import { processBatch } from "./pipeline";
import { insertBatch } from "./store";
import { RecordInput } from "./types";

const BATCH_SIZE = 10;

export const ingest = async (rows: RecordInput[]) => {
  let buffer: RecordInput[] = [];

  for (let i = 0; i < rows.length; i++) {
    buffer.push(rows[i]);

    if (buffer.length >= BATCH_SIZE) {
      await flush(buffer);
      buffer = [];
    }
  }

  if (buffer.length > 0) {
    await flush(buffer);
  }
};

const flush = async (batch: RecordInput[]) => {
  let attempts = 0;

  while (attempts < 3) {
    try {
      const processed = await processBatch(batch);

      const unique = processed.filter((r, i) => i === processed.indexOf(r));

      await insertBatch(unique);
      return;
    } catch {
      attempts++;
    }
  }
};
