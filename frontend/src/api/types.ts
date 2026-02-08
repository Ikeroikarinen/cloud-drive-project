export type User = {
  id: string;
  email: string;
  username: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Doc = {
  _id: string;
  title: string;
  content: string;

  ownerId?: string;

  editorIds?: string[];

  isPublic?: boolean;
  publicToken?: string | null;

  lockedBy?: string | null;
  lockedAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

export type ShareResponse = {
  isPublic: boolean;
  publicToken?: string | null;
};

export type PublicDoc = {
  _id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};
