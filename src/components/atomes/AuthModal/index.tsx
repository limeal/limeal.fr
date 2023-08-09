"use client";

import { useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-toastify";
import { LiaEyeSolid, LiaEyeSlash } from "react-icons/lia";

import { signIn } from "@/firebase/authentication";
import "./style.scss";
import Modal from "../Modal";
import { InputContainer } from "../InputContainer";

const AuthModal = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("You are now logged in!");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to log in!");
    }
    setLoading(false);
  };

  return (
    <Modal
      title="Sign in"
      lore="your credentials"
      buttonText="Sign in"
      loading={loading}
      setLoading={setLoading}
      setOpen={setOpen}
      onSubmit={login}
      inputs={[
        <InputContainer key={0} label="Email">
          <input
            type="email"
            name="email"
            id="email"
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </InputContainer>,
        <InputContainer
          key={1}
          label="Password"
          button={{
            onClick: () => setShowPassword(!showPassword),
            content: showPassword ? <LiaEyeSlash /> : <LiaEyeSolid />,
          }}
        >
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </InputContainer>,
      ]}
    />
  );
};

export default AuthModal;
