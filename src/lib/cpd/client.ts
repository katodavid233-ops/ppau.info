export type CpdPointItem = {
  type: "claim" | "submission";
  source: string;
  title: string;
  points: number;
  date: string | null;
  event_date: string | null;
  passed: boolean;
  score: number | null;
  certificate_code: string | null;
};

export type CpdPointsResponse = {
  ppau_reg_no: string;
  total_points: number;
  count: number;
  items: CpdPointItem[];
};
