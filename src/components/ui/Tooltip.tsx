import type { ReactNode } from 'react';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  children: ReactNode;
  label: string;
  placement?: Placement;
}

export function Tooltip({ children, label, placement = 'top' }: TooltipProps) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className={`tooltip-content ${placement}`}>
        {label}
      </div>
    </div>
  );
}
