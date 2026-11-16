import { useLayoutEffect, useRef } from 'react';

const DURATION_MS = 280;
const EASING = 'cubic-bezier(0.2, 0, 0, 1)';
const FLIP_ANIMATION_ID = 'flip';

/**
 * Animates reordering of a list (FLIP: First, Last, Invert, Play). Direct children marked with
 * `data-flip-id` slide from their old position to the new one when `order` changes, and items
 * that just appeared fade in. Without it, moved cards jump and the eye loses track of them.
 *
 * Positions use offsetTop, which ignores transforms, so a render in the middle of an animation
 * (e.g. a hover) doesn't record a half-moved position.
 */
export function useFlipAnimation<T extends HTMLElement>(order: string) {
  const containerRef = useRef<T>(null);
  const positions = useRef(new Map<string, number>());
  const lastOrder = useRef(order);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const isReordered = lastOrder.current !== order;
    lastOrder.current = order;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const next = new Map<string, number>();

    container.querySelectorAll<HTMLElement>(':scope > [data-flip-id]').forEach((element) => {
      const id = element.dataset.flipId ?? '';
      const top = element.offsetTop;
      next.set(id, top);
      if (!isReordered || isReducedMotion) {
        return;
      }

      // Restart from the real position if the previous slide is still running.
      element
        .getAnimations()
        .filter((animation) => animation.id === FLIP_ANIMATION_ID)
        .forEach((animation) => animation.cancel());

      const previousTop = positions.current.get(id);
      if (previousTop === undefined) {
        element.animate(
          [
            { opacity: 0, transform: 'scale(0.98)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: DURATION_MS, easing: EASING, id: FLIP_ANIMATION_ID }
        );
        return;
      }
      const delta = previousTop - top;
      if (Math.abs(delta) > 1) {
        element.animate([{ transform: `translateY(${delta}px)` }, { transform: 'none' }], {
          duration: DURATION_MS,
          easing: EASING,
          id: FLIP_ANIMATION_ID,
        });
      }
    });

    positions.current = next;
  });

  return containerRef;
}
