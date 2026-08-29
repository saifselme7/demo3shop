import { cn } from '@/lib/utils';

interface Loader3Props {
  className?: string;
}

export const Component = ({ className }: Loader3Props) => {
  return (
    <div className={cn('loader-3', className)} aria-hidden="true">
      <div className="loader-3__box loader-3__box0">
        <div />
      </div>
      <div className="loader-3__box loader-3__box1">
        <div />
      </div>
      <div className="loader-3__box loader-3__box2">
        <div />
      </div>
      <div className="loader-3__box loader-3__box3">
        <div />
      </div>
      <div className="loader-3__box loader-3__box4">
        <div />
      </div>
      <div className="loader-3__box loader-3__box5">
        <div />
      </div>
      <div className="loader-3__box loader-3__box6">
        <div />
      </div>
      <div className="loader-3__box loader-3__box7">
        <div />
      </div>
      <div className="loader-3__ground">
        <div />
      </div>
    </div>
  );
};

export { Component as Loader3 };
