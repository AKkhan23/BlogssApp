export interface IAuthor {
  _id: string;
  name: string;
  email: string;
}

export interface IComment {
  _id: string;
  user: IAuthor;
  text: string;
  createdAt: string;
}

export interface IPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  author: IAuthor;
  likes: string[];
  comments: IComment[];
  createdAt: string;
  updatedAt: string;
}

export interface PostFormData {
  title: string;
  content: string;
  coverImage?: string;
}

export interface PostsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PostsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
