interface NovelInfoAuthor {
  id: number;
  name: string;
}

export interface NovelInfo {
  id: number;
  title: string;
  author: NovelInfoAuthor;
  cover: string;
  charCount: number;
  isFinish: boolean;
}

export interface ChapterInfo {
  id: number;
  title: string;
  charCount: number;
  createTime: string;
  updateTime: string | null;
}
