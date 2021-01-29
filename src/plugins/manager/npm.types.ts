export interface SearchedPackage {
  author?: {
    name: string;
    email: string;
    username: string;
  };
  date: string;
  description: string;
  keywords: string[];
  links: string[];
  name: string;
  maintainers: { username: string; email: string }[];
  publisher: { email: string; username: string };
  scope: string;
  version: string;
}

export interface InstalledPackage {
  from: string;
  resolved: string;
  version: string;
}

export type SearchedPackages = SearchedPackage[];
export type InstalledPackages = Partial<{
  [i: string]: InstalledPackage;
}>;
