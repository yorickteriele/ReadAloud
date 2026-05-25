import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { classNames } from '../../lib/utils/layout';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo = ({ className = '', iconOnly = false }: LogoProps) => {
  const content = (
    <>
      <span
        className="inline-grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl text-lg font-bold text-primary bg-primary/10 border border-primary/20 shadow-inner"
        aria-hidden="true"
      >
        <BookOpen className="w-6 h-6" />
      </span>
      {!iconOnly && (
        <span className="grid gap-0.5">
          <strong className="text-base tracking-[0.02em] font-black text-foreground">ReadAloud</strong>
        </span>
      )}
    </>
  );

  return (
    <Link className={classNames('inline-flex items-center gap-3 text-inherit no-underline', className)} to="/library">
      {content}
    </Link>
  );
};
