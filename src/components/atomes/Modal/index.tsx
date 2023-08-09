"use client";

import { useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai";

import "./style.scss";

const Modal = ({
  title,
  lore,
  inputs,
  buttonText,
  setOpen,
  onSubmit,
  loading,
  setLoading,
}: {
  title: string;
  lore: string;
  inputs: React.ReactElement[];
  buttonText: string;
  setOpen: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}) => {

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset"
    }
  }, []);

  return (
    <div className="modal">
      <div className="modal__overlay" onClick={() => setOpen(false)}></div>
      <form onSubmit={onSubmit}>
        <div className="modal__header">
          <button type="button" onClick={() => setOpen(false)}>
            <AiOutlineClose />
          </button>
          <div>
            <h2>{title}</h2>
            <p>
              with <strong>{lore}</strong>
            </p>
          </div>
        </div>
        <ul className="modal__body">
          {inputs.map((input, index) => {
            return <li key={index}>{input}</li>;
          })}
        </ul>
        <div className="modal__footer">
          <button
            type="submit"
            style={{
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? (
              <AiOutlineLoading3Quarters className="loading" />
            ) : (
              buttonText
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Modal;
