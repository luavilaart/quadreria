import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export function QButton({ className, ...props }: ButtonProps) { return <Button variant="unstyled" {...props} className={cn('btn h-auto whitespace-normal rounded-full shadow-none', className)} />; }
