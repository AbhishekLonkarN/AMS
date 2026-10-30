import type React from 'react';
import { useEffect, useRef, useState } from 'react';

/** Must match the transition duration in Drawer.module.css (duration-300). */
export const OVERLAY_TRANSITION_MS = 300;

/**
 * Drives a native <dialog> with enter/exit animations:
 * open → showModal(), then `isShown` (transition in);
 * close → `isShown` false (transition out), then dialog.close() and unmount content.
 */
export function useAnimatedDialog(isOpen: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      return;
    }
    setIsShown(false);
    const timer = setTimeout(() => {
      dialogRef.current?.close();
      setIsMounted(false);
    }, OVERLAY_TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !isMounted || !dialog) return;
    // showModal() focuses the first focusable element; inside a still off-screen panel that
    // makes the browser scroll it into view and breaks the slide. Focus the dialog itself instead.
    dialog.autofocus = true;
    if (!dialog.open) dialog.showModal();
    dialog.scrollLeft = 0;
    dialog.scrollTop = 0;
    // The dialog was display:none until now: flush styles and wait two frames so the
    // off-screen "from" state is painted before the transition starts.
    void dialog.offsetHeight;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setIsShown(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [isOpen, isMounted]);

  // Lock page scroll behind the overlay.
  useEffect(() => {
    if (!isMounted) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [isMounted]);

  return { dialogRef, isMounted, isShown };
}

/**
 * Escape closes through `onClose` (so the URL / state stays in sync):
 * caught on keydown first; `cancel` as fallback; and if the browser force-closes
 * the dialog anyway (Chrome does on repeated Escape) it is re-shown and closed properly.
 */
export function useDialogEscape(
  dialogRef: React.RefObject<HTMLDialogElement | null>,
  isOpen: boolean,
  onClose: () => void,
) {
  return {
    onKeyDown: (e: React.KeyboardEvent<HTMLDialogElement>) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      onClose();
    },
    onCancel: (e: React.SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      onClose();
    },
    onClose: () => {
      const dialog = dialogRef.current;
      if (isOpen && dialog && !dialog.open) {
        dialog.showModal();
        onClose();
      }
    },
  };
}
