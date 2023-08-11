import getTranslation from "@/utils/lang";

import "./style.scss";

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
            <a href={element.href}>
              {getTranslation(lang || "en", element.tid)}
            </a>
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
