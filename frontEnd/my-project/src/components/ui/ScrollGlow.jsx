import { useEffect, useState } from "react";

const ScrollGlow = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const opacity = 0.08 + progress * 0.25;
  const blur = 32 + progress * 36;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-all duration-300"
      style={{
        background: `
          radial-gradient(60rem 30rem at 20% 0%, rgba(250, 204, 21, ${opacity}), transparent 60%),
          radial-gradient(55rem 28rem at 85% 25%, rgba(245, 158, 11, ${opacity * 0.7}), transparent 65%)
        `,
        filter: `blur(${blur}px)`,
      }}
    />
  );
};

export default ScrollGlow;
