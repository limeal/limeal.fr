"use client";

import { useLangContext } from "@/contexts/LangContext";
import "./style.scss";
import Link from "next/link";

interface TabsProps {
  elements: Tab[];
  onClick?: () => void;
}

const Tabs = ({ elements, onClick }: TabsProps) => {

  const { getTranslation } = useLangContext();

  return (
    <ul>
      {elements.map((element: Tab, index) => (
        <li key={index} onClick={onClick}>
          {element.type === "link" ? (
            <Link href={element.href || ""}>
              {getTranslation(element.tid)}
            </Link>
          ) : (
            <button onClick={element.onClick}>
              {getTranslation(element.tid)}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Tabs;
