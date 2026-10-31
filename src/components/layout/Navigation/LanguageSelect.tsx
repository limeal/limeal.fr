"use client";

import { NativeSelect } from "@chakra-ui/react";

import { useLangContext } from "@/contexts/LangContext";

export const LanguageSelect = () => {
  const { lang, langs, updateLang } = useLangContext();

  return (
    <NativeSelect.Root size="sm" variant="plain" width="auto">
      <NativeSelect.Field
        aria-label="Language"
        value={lang}
        onChange={(e) => updateLang(e.currentTarget.value)}
        color="muted"
        fontWeight="bold"
        cursor="pointer"
        _hover={{ color: "white" }}
        css={{ "& option": { bg: "#1d1c1f", color: "white" } }}
      >
        {langs.map((code) => (
          <option key={code} value={code}>
            {code.toUpperCase()}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator color="muted" />
    </NativeSelect.Root>
  );
};

export default LanguageSelect;
