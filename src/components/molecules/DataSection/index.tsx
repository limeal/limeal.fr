"use client";

import { useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import { LuRefreshCcw } from "react-icons/lu";

import { useAuthContext } from "@/contexts/AuthContext";

import "./style.scss";
import BaseLoading from "@/components/atomes/BaseLoading";
import { useLangContext } from "@/contexts/LangContext";

const DataSection = ({
  sectionName,

  filters,
  selectedFilter,
  setSelectedFilter,

  elements,

  callbackAdd,
  callbackChild,

  refresh,
  loading,
}: {
  sectionName: string;

  filters: string[];
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;

  elements: any[];

  callbackAdd: (props: {
    setIsMenuOpen: (open: boolean) => void;
    refresh: () => void;
  }) => React.ReactElement;
  callbackChild: (props: {
    element: any;
    refresh: () => void;
  }) => React.ReactElement;

  refresh: (isClick: boolean) => Promise<void>;
  loading: boolean;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const { user } = useAuthContext();
  const { getTranslation } = useLangContext();

  return (
    <section className="data-section" id={sectionName}>
      {isMenuOpen &&
        callbackAdd({ setIsMenuOpen, refresh: () => refresh(false) })}
      <div className="title">
        <div>
          <h1>{getTranslation(`${sectionName}--title`)}</h1>
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
        <p>{getTranslation(`${sectionName}--description`)}</p>
      </div>
      {!loading ? (
        <>
          <ul className="filters">
            {filters.map((name, index) => (
              <li
                key={index}
                className={selectedFilter === name ? "active" : ""}
                onClick={() =>
                  setSelectedFilter(selectedFilter === name ? "" : name)
                }
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
                {getTranslation(`${sectionName}--error`)}
              </p>
            )}
          </div>
        </>
      ) : (
        <BaseLoading />
      )}
    </section>
  );
};

export default DataSection;
