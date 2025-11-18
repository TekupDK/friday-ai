import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Detects if the current viewport is mobile-sized
 * 
 * @returns `true` if viewport width < 768px, `false` otherwise
 * 
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * return isMobile ? <MobileView /> : <DesktopView />;
 * ```
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []); // Setup mobile breakpoint detection

  return !!isMobile;
}

