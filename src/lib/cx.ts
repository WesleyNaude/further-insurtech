import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cx = (...i: ClassValue[]) => twMerge(clsx(i))
