'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Custom hook for 2D spatial navigation using D-pad (Arrow Keys)
 * Optimized for Smart TV remote controls.
 */
export function useDpadNavigation() {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const registry = useRef<Set<HTMLElement>>(new Set());

  // Register an element as focusable
  const registerElement = useCallback((el: HTMLElement | null) => {
    if (el) {
      registry.current.add(el);
      // Auto-focus the first element if nothing is focused
      if (!focusedId) {
        // We'll handle initial focus in a separate useEffect for stability
      }
    }
  }, [focusedId]);

  // Unregister an element
  const unregisterElement = useCallback((el: HTMLElement | null) => {
    if (el) {
      registry.current.delete(el);
    }
  }, []);

  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const current = document.activeElement as HTMLElement;
    if (!current || !registry.current.has(current)) {
      // If nothing is focused, pick the first one from registry
      const first = Array.from(registry.current)[0];
      first?.focus();
      return;
    }

    const currentRect = current.getBoundingClientRect();
    const candidates = Array.from(registry.current).filter(el => el !== current);

    let bestMatch: HTMLElement | null = null;
    let minDistance = Infinity;

    candidates.forEach(candidate => {
      const rect = candidate.getBoundingClientRect();
      const isCorrectDirection = {
        up: rect.bottom <= currentRect.top + 5, // small buffer
        down: rect.top >= currentRect.bottom - 5,
        left: rect.right <= currentRect.left + 5,
        right: rect.left >= currentRect.right - 5
      }[direction];

      if (!isCorrectDirection) return;

      // Calculate spatial distance
      // We prioritize alignment in the axis of movement
      let dist: number;
      if (direction === 'up' || direction === 'down') {
        const xDist = Math.abs((rect.left + rect.width / 2) - (currentRect.left + currentRect.width / 2));
        const yDist = Math.abs((rect.top + rect.height / 2) - (currentRect.top + currentRect.height / 2));
        dist = yDist + xDist * 2; // Penalize horizontal misalignment more for vertical movement
      } else {
        const xDist = Math.abs((rect.left + rect.width / 2) - (currentRect.left + currentRect.width / 2));
        const yDist = Math.abs((rect.top + rect.height / 2) - (currentRect.top + currentRect.height / 2));
        dist = xDist + yDist * 2; // Penalize vertical misalignment more for horizontal movement
      }

      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = candidate;
      }
    });

    if (bestMatch) {
      (bestMatch as HTMLElement).focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveFocus('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveFocus('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveFocus('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveFocus('right');
          break;
        case 'Enter':
          // Standard button/link behavior handles Enter naturally if focused
          break;
        case 'Escape':
          // Handle "Back" functionality
          window.dispatchEvent(new CustomEvent('tv-back'));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveFocus]);

  // Handle initial focus
  useEffect(() => {
    const timer = setTimeout(() => {
      if (registry.current.size > 0 && !document.activeElement?.hasAttribute('data-focusable')) {
        const first = Array.from(registry.current).sort((a,b) => {
          const rA = a.getBoundingClientRect();
          const rB = b.getBoundingClientRect();
          return (rA.top + rA.left) - (rB.top + rB.left);
        })[0];
        first?.focus();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { registerElement, unregisterElement, setFocusedId };
}
