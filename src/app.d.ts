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
  }

  type Section = {
    id: number;
    timeString: string;
    timestamp: number;
    text: string;
    searchHit?: boolean;
  };

  type Bookmark = {
    videoSlug: string;
    timestamp: number;
    createdAt: Date;
  };
}

export {
};
