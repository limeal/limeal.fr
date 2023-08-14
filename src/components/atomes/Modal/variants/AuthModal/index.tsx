"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LiaEyeSolid, LiaEyeSlash } from "react-icons/lia";

import { signIn } from "@/firebase/authentication";
import { InputContainer } from "../../InputContainer";
import Modal from "../..";

const AuthModal = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const [width, setWidth] = useState(0);

  const updateDimension = () => setWidth(window.innerWidth);

  useEffect(() => {
    updateDimension();
    window.addEventListener("resize", updateDimension);

    if (localStorage.getItem("remember")) {
      setEmail(localStorage.getItem("email") || "");
      setPassword(localStorage.getItem("password") || "");
      setRemember(true);
    }

    return () => window.removeEventListener("resize", updateDimension);
  }, []);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);


    if (remember) {
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
      localStorage.setItem("remember", "true");
    } else {
      localStorage.removeItem("email");
      localStorage.removeItem("password");
      localStorage.removeItem("remember");
    }

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
      overrideStyle={{
        modal: {
          justifyContent: width >= 1280 ? "center" : "flex-start",
        },
      }}
      inputs={[
        <InputContainer key={0} label="Email">
          <input
            type="email"
            name="email"
            id="email"
            value={email}
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
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </InputContainer>,
        <InputContainer
          key={2}
          label="Remember me ?"
          style={{ flexDirection: "row", alignItems: "center", gap: "20px" }}
        >
          <input
            type="checkbox"
            name="remember"
            id="remember"
            checked={remember}
            style={{
              width: "20px",
              height: "20px",
              border: "none",
              filter: "hue-rotate(0deg)",
              outline: "none",
              margin: 0,
            }}
            onChange={(e) => {
              setRemember(e.currentTarget.checked);
            }}
          />
        </InputContainer>,
      ]}
    />
  );
};

export default AuthModal;
