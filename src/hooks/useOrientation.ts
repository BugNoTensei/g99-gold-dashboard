import { useState, useEffect } from "react";

type Orientation = "portrait" | "landscape";

interface OrientationInfo {
  orientation: Orientation;
  isTV: boolean;
}

function detectTV(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  const isTVUA =
    /smart-tv|smarttv|googletv|appletv|hbbtv|netcast|viera|nettv|philipstv|roku|tizen|webos/.test(
      ua,
    );
  const isLargeSquareScreen =
    window.screen.width >= 1080 && window.screen.height >= 1080;
  return isTVUA || isLargeSquareScreen;
}

function getOrientation(): Orientation {
  return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
}

export function useOrientation(): OrientationInfo {
  const [info, setInfo] = useState<OrientationInfo>(() => ({
    orientation: getOrientation(),
    isTV: detectTV(),
  }));

  useEffect(() => {
    const handler = () =>
      setInfo({ orientation: getOrientation(), isTV: detectTV() });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return info;
}
