
export type ShotType = 'MAIN' | 'LIFESTYLE' | 'DETAIL' | 'ANGLE' | 'DIMENSION';

export interface ProductShot {
  id: string;
  type: ShotType;
  label: string;
  description: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  error?: string;
}

export interface ProductConfig {
  name: string;
  color?: string;
  material?: string;
  targetAudience?: string;
}
