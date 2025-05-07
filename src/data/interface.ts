export interface NovelInfo {
  id: number;
  title: string;
  author: string;
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

export interface ThanatosVersion {
  version: string;
  gitHash: string;
  buildTime: number;
}
