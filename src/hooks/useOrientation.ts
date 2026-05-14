import { useState, useEffect } from "react";

type Orientation = "portrait" | "landscape";

interface OrientationInfo {
  orientation: Orientation;
  isDesktopOrTV: boolean;
}

function isTouchOnlyDevice(): boolean {
  return (
    navigator.maxTouchPoints > 0 &&
    !window.matchMedia("(pointer: fine)").matches
  );
}

function detectDesktopOrTV(): boolean {
  const ua = navigator.userAgent.toLowerCase();

  const isTVUA =
    /smart-tv|smarttv|googletv|appletv|hbbtv|netcast|viera|nettv|philipstv|roku|tizen|webos|android.*tv|atv|aftv|xbox|crkey/.test(
      ua,
    );

  const isMobileUA = /iphone|ipod|android.*mobile|windows phone/.test(ua);

  const isTabletUA = /ipad|android(?!.*mobile)|tablet|surface/.test(ua);

  if (isTVUA) {
    return true;
  }

  if (isMobileUA || isTabletUA || isTouchOnlyDevice()) {
    return false;
  }

  return window.innerWidth >= 768 || window.innerHeight >= 768;
}

function getOrientation(): Orientation {
  return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
}

export function useOrientation(): OrientationInfo {
  const [info, setInfo] = useState<OrientationInfo>(() => ({
    orientation: getOrientation(),
    isDesktopOrTV: detectDesktopOrTV(),
  }));

  useEffect(() => {
    const handler = () =>
      setInfo({
        orientation: getOrientation(),
        isDesktopOrTV: detectDesktopOrTV(),
      });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return info;
}
