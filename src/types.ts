export interface Game {
  id: string;
  name: string;
  size: string;
  rating: number;
  category: string;
  image: string;
  description: string;
  downloadUrl: string;
  requirements: string;
  videoUrl: string;
}

export interface AdSettings {
  headerAd: string;
  downloadPageAd: string;
}

export interface SiteSettings {
  backgroundImage: string;
  backgroundVideo: string;
  backgroundType: 'image' | 'video';
  backgroundColor: string;
  backgroundAnimation: 'none' | 'slow-pulse' | 'gentle-orbit';
  overlayOpacity: number;
  logoImage?: string;
  logoSize?: number;
}
