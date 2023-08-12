"use client";

import { useEffect, useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import { LuRefreshCcw } from "react-icons/lu";

import getTranslation from "@/utils/lang";
import { useAuthContext } from "@/contexts/AuthContext";

import "./style.scss";

const DataSection = ({
  sectionName,

  filters,
  selectedFilter,
  setSelectedFilter,

  elements,

  callbackAdd,
  callbackChild,

  refresh,
  lang,
}: {
  sectionName: string;

  filters: string[];
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;

  elements: any[];

  callbackAdd: (props: { setIsMenuOpen: (open :boolean) => void; refresh: () => void }) => React.ReactElement;
  callbackChild: (props: {
    element: any;
    refresh: () => void;
  }) => React.ReactElement;

  refresh: (isClick: boolean) => void;
  lang: string;
}) => {

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const { user } = useAuthContext();

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  return (
    <section className="data-section" id={sectionName}>
      {isMenuOpen && callbackAdd({ setIsMenuOpen, refresh: () => refresh(false) })}
      <div className="title">
        <div>
          <h1>{getTranslation(lang, `${sectionName}--title`)}</h1>
          <button
            className="refresh"
            onClick={(e) => {
              e.preventDefault();
              refresh(true);
            }}
          >
            <LuRefreshCcw />
          </button>
          {user && user.uid === process.env.NEXT_PUBLIC_ADMIN_USER_ID && (
            <button
              className={`element-add`}
              onClick={() => setIsMenuOpen(true)}
            >
              <AiFillPlusCircle />
            </button>
          )}
        </div>
        <p>{getTranslation(lang, `${sectionName}--description`)}</p>
      </div>
      <ul className="filters">
        {filters.map((name, index) => (
          <li
            key={index}
            className={selectedFilter === name ? "active" : ""}
            onClick={() => setSelectedFilter(selectedFilter === name ? "" : name)}
          >
            {name.replace("_", " ")}
          </li>
        ))}
      </ul>
      <div className={`elements`}>
        {elements ? (
          <ul>
            {elements.map((element: any, index: number) => (
              <li key={index}>
                {callbackChild({ element, refresh: () => refresh(false) })}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`no-elements`}>
            {getTranslation(lang, `${sectionName}--error`)}
          </p>
        )}
      </div>
    </section>
  );
};

export default DataSection;