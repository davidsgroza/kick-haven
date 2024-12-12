export interface Post {
  _id: string;
  categoryId: string;
  categoryName: string;
  userId: string;
  username: string;
  parentPost: boolean; // `true` for parent posts, `false` for comments
  title?: string;
  text: string;
  date: string;
  parentPostId: string | null; // `null` for parent posts
  upvotes: number;
  downvotes: number;
  locked: boolean;
  lastEdited?: string;
  comments?: Post[];
}
