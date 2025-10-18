
export type ConversionMode = 'jpeg-to-pdf' | 'pdf-to-jpeg';

export interface FileWithPreview extends File {
  preview: string;
}
