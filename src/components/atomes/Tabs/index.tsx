import getTranslation from "@/utils/lang";

import "./style.scss";
import Link from "next/link";

interface TabsProps {
  lang?: string;
  elements: Tab[];
  onClick?: () => void;
}

const Tabs = ({ lang, elements, onClick }: TabsProps) => {
  return (
    <ul>
      {elements.map((element: Tab, index) => (
        <li key={index} onClick={onClick}>
          {element.type === "link" ? (
            <Link href={element.href || ""}>
              {getTranslation(lang || "en", element.tid)}
            </Link>
          ) : (
            <button onClick={element.onClick}>
              {getTranslation(lang || "en", element.tid)}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Tabs;
