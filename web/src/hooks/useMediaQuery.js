import { useEffect, useState } from "react";
export function useMediaQuery(query, initialValue = false) {
  const getMatch = () => {
    if (typeof window === "undefined") return initialValue;
    return window.matchMedia(query).matches;
  };
  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
