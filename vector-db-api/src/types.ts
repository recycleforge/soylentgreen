export type Doc = {
  id: string;
  text: string;
};

export type Vec = {
  id: string;
  vector: number[];
};

export type SearchResult = {
  id: string;
  score: number;
};
