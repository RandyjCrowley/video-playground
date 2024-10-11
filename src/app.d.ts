// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  type Video = {
    slug: string;
    title: string;
    description: string;
  };

  type Section = {
    id: number;
    timeString: string;
    timestamp: number;
    text: string;
    highlightedText?: string;
    active: boolean;
  };

  type Bookmark = {
    videoSlug: string;
    startTime: number;
    endTime: number;
    createdAt: Date;
    title: string;
    note: string;
  };

  type BookmarkUpdateParams = Partial<
    Omit<Bookmark, "timestamp", "videoSlug" | "createdAt">
  >;
}

export {};
