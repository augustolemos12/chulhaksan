export interface MonthEvent {
  id: number;
  title: string;
  imageUrl?: string | null;
  imageUrlSquare?: string | null;
  imageUrlVertical?: string | null;
  imageUrlBanner?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type EventImageContext = 'desktop' | 'mobile' | 'square';
