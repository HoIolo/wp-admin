export type HomeData = {
  userTotal: number;
  articleTotal: number;
  commentTotal: number;
  tagTotal: number;
  visitorTotal: number;
};

export type VisitorData = {
  id: number;
  date: string;
  count: number;
  remark: string | null;
  createTime: string | null;
  updatedTime: string | null;
  deleteAt: string | null;
};
