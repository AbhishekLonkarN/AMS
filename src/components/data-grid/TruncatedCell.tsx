import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Tooltip } from '@/components/overlay';

interface TruncatedCellProps {
  /** The full text, shown in the tooltip when the cell is cut off. */
  text: string;
  children: ReactNode;
}

/** One line with an ellipsis; the full value shows in a tooltip on hover, only when it is actually cut off. */
export function TruncatedCell({ text, children }: TruncatedCellProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isCut, setIsCut] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) {setIsCut(el.scrollWidth > el.clientWidth);}
  }, [text]);

  const span = (
    <span ref={ref} className="block max-w-xs truncate">
      {children}
    </span>
  );
  return isCut ? <Tooltip content={text}>{span}</Tooltip> : span;
}
