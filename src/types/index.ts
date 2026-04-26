export type Vibe = 'indica' | 'sativa';

export type Munchie = 'pizza' | 'sweets' | 'fastfood' | 'snacks' | 'asian';

export type SwipeDirection = 'pass' | 'ash' | 'hotbox';

export type UserProfile = {
  uid: string;
  displayName: string;
  bio: string;
  vibe: Vibe;
  munchies: Munchie[];
  photos: string[];
  ageVerifiedAt: number | null;
  country: 'NL';
};

export type Match = {
  id: string;
  users: [string, string];
  createdAt: number;
  lastMessageAt: number | null;
  status: 'active' | 'unmatched';
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
  readBy: string[];
};
