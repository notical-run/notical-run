import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...cls: ClassValue[]) => twMerge(clsx(cls));
