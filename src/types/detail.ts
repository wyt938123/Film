export type TopBarItem = {
  key:string
  label:string
};

export type VideoMainInfo = {
  title: string;
  des: string;
  maindata: Array<any>;
};

export interface VideoDetailData {
  videoId: string;
  title: string;
  subtitle?: string;
  cover: string;
  score: number;
  playCount: number;
  tags: string[];
  categories: CategoryTag[];
  description: string;
  releaseYear: number;
  region: string;
  director: string;
  actors: string[];
  duration: string;
  updateInfo: UpdateInfo;
  actionStats: ActionStats;
  episodes: EpisodesData;
}

export interface CategoryTag {
  name: string;
  rank?: number;
  highlight?: boolean;
}

export interface UpdateInfo {
  current: number;
  total: number;
  updateText: string;
  updateDay?: string;
}

export interface ActionStats {
  recommends: number;
  favorites: number;
  downloads: number;
  shares: number;
  views?: number;
}

export interface EpisodesData {
  [key: string]: Episode[];
}

export interface Episode {
  id: number;
  title: string;
  episodeNumber: number;
  duration: string;
  isVip: boolean;
  isFree: boolean;
  isNew?: boolean;
  videoUrl?: string;
  cover?: string;
  playProgress?: number;
}

export interface EpisodeTab {
  tabName: string;
  episodes: Episode[];
  total: number;
}

export interface VideoMetaStats {
  score: number;
  scoreText: string;
  playCount: number;
  playCountText: string;
}

export interface VideoAction {
  icon: string;
  label: string;
  count?: number;
  active?: boolean;
}
