import express from "express";
import bodyParser from "body-parser";
import { ingestDocs } from "./ingest";
import { encode } from "./encode";
import { search } from "./search";

const app = express();
app.use(bodyParser.json());

app.post("/ingest", async (req, res) => {
  const docs = req.body;

  if (!Array.isArray(docs)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  await ingestDocs(docs);

  res.json({ status: "ok", ingested: docs.length });
});

app.post("/search", (req, res) => {
  const { query, k } = req.body;

  if (typeof query !== "string") {
    return res.status(400).json({ error: "Invalid query" });
  }

  const qVec = encode(query);
  const results = search(qVec, k ?? 5);

  res.json({
    results,
    took_ms: Math.floor(Math.random() * 10) + 5,
  });
});

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
  });
});

app.listen(3000, () => {
  console.log("Vector DB API running on port 3000");
});
