"use client";

import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

// Emotion (Chakra's style engine) writes <style> tags inline while rendering on
// the server, where the client expects the components' own elements: a
// hydration mismatch. This collects the styles of each server render and
// emits them in the document head instead.
const EmotionRegistry = ({ children }: { children: React.ReactNode }) => {
  const [registry] = useState(() => {
    const cache = createCache({ key: "css" });
    cache.compat = true;

    let inserted: { name: string; isGlobal: boolean }[] = [];
    const insert = cache.insert;
    cache.insert = (...args) => {
      const [selector, serialized] = args;
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push({ name: serialized.name, isGlobal: !selector });
      }
      return insert(...args);
    };

    const flush = () => {
      const flushed = inserted;
      inserted = [];
      return flushed;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = registry.flush();
    if (names.length === 0) return null;

    const globals: { name: string; style: string }[] = [];
    let styles = "";
    let dataEmotion = registry.cache.key;

    for (const { name, isGlobal } of names) {
      const style = registry.cache.inserted[name];
      if (typeof style !== "string") continue;
      if (isGlobal) {
        globals.push({ name, style });
      } else {
        styles += style;
        dataEmotion += ` ${name}`;
      }
    }

    return (
      <>
        {globals.map(({ name, style }) => (
          <style
            key={name}
            data-emotion={`${registry.cache.key}-global ${name}`}
            dangerouslySetInnerHTML={{ __html: style }}
          />
        ))}
        {styles && <style data-emotion={dataEmotion} dangerouslySetInnerHTML={{ __html: styles }} />}
      </>
    );
  });

  return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
};

export default EmotionRegistry;
