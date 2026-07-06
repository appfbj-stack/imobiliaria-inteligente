import { cn } from '../../lib/cn';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = { sm: 'h-7 w-7 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' };

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover border border-border', sizeClasses[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary/15 font-semibold text-primary border border-primary/20',
        sizeClasses[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
