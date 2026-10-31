"use client";

import { useEffect, useState } from "react";

// Id of the section crossing the middle of the viewport
export const useActiveSection = (ids: string[]) => {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    key
      .split(",")
      .map((id) => document.getElementById(id))
      .forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, [key]);

  return active;
};

export default useActiveSection;
