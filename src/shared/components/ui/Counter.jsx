import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Animates a number from 0 to the target value.
 * @param {number} target - Final value.
 * @param {number} duration - Animation duration in milliseconds.
 * @returns {number} Animated value.
 */
export const useCountUp = (target, duration = 1000) => {
  const safeTarget = Number.isFinite(Number(target)) ? Number(target) : 0;
  const safeDuration = Number.isFinite(Number(duration))
    ? Math.max(Number(duration), 0)
    : 1000;

  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (safeDuration === 0) {
      setValue(safeTarget);
      return undefined;
    }

    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / safeDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(eased * safeTarget));

      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [safeTarget, safeDuration]);

  return value;
};

/**
 * Displays an animated counter value.
 * @param {Object} props - Component props.
 * @param {number} props.value - Target number.
 * @param {number} [props.duration=1000] - Animation duration in milliseconds.
 * @param {string} [props.prefix=""] - Text shown before the number.
 * @param {string} [props.suffix=""] - Text shown after the number.
 * @param {(value: number) => string} [props.formatter] - Optional value formatter.
 * @param {string} [props.className=""] - Optional className for wrapper.
 * @returns {JSX.Element} Animated counter element.
 */
const Counter = ({
  value = 0,
  duration = 1000,
  prefix = "",
  suffix = "",
  formatter,
  className = "",
}) => {
  const animatedValue = useCountUp(value, duration);

  const displayValue = useMemo(() => {
    if (typeof formatter === "function") {
      return formatter(animatedValue);
    }

    return animatedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }, [animatedValue, formatter]);

  return (
    <span className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

export default Counter;
