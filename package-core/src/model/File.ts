import { Blob } from 'blob-polyfill';

export interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
}
