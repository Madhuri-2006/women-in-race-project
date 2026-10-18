import { useEffect, useRef, useState } from "react";
import "./StatCounter.css";

function StatCounter({ value, suffix = "", label, duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  const nodeRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const animate = () => {
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(value * eased));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          animate();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <div className="stat-counter" ref={nodeRef}>
      <div className="stat-number">
        {display}
        {suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default StatCounter;
