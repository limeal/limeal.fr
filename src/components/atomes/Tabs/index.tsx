import getTranslation from "@/utils/lang";

import "./style.scss";

interface TabsProps {
  lang?: string;
  additionals?: {
    id: string;
    tid: string;
  }[];
  onClick?: (e: any) => void;
}

const Tabs = ({ lang, additionals, onClick }: TabsProps) => {
  return (
    <ul>
      <li>
        <a href="#about-me" onClick={onClick}>
          {getTranslation(lang || 'en', "tabs--about-me")}
        </a>
      </li>
      <li>
        <a href="#skills" onClick={onClick}>
          {getTranslation(lang || 'en', "tabs--skills")}
        </a>
      </li>
      <li>
        <a href="#portfolio" onClick={onClick}>
          {getTranslation(lang || 'en', "tabs--portfolio")}
        </a>
      </li>{/* 
      <li>
        <a href="#testimonial"
          {getTranslation(lang || 'en', "tabs--testimonial")}
        </a>
      </li> */}
      {additionals &&
        additionals.map((additional: {
            id: string;
            tid: string;
        }) => (
          <li key={additional.id}>
            <a href={`#${additional.id}`} onClick={onClick}>
              {getTranslation(lang || 'en', additional.tid)}
            </a>
          </li>
        ))}
    </ul>
  );
};

export default Tabs;