"use client";

import { useEffect, useState } from "react";
import { Checkbox, IconButton, Input, InputGroup } from "@chakra-ui/react";
import { LuEye, LuEyeOff } from "react-icons/lu";

import { signIn } from "@/firebase/authentication";
import { useLangContext } from "@/contexts/LangContext";
import Modal from "@/components/ui/Modal";
import FormField, { fieldStyles } from "@/components/ui/FormField";
import { toast } from "@/components/ui/Toaster";

const rememberedEmail = () => {
  try {
    return localStorage.getItem("remember") ? localStorage.getItem("email") || "" : null;
  } catch {
    return null;
  }
};

const AuthModal = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  // "Remember me" only keeps the e-mail (read once, the modal mounts client-side)
  const [email, setEmail] = useState(() => (rememberedEmail() ?? ""));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(() => rememberedEmail() !== null);

  const { getTranslation } = useLangContext();

  useEffect(() => {
    // Passwords used to be remembered in clear text: drop any leftover
    localStorage.removeItem("password");
  }, []);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (remember) {
      localStorage.setItem("email", email);
      localStorage.setItem("remember", "true");
    } else {
      localStorage.removeItem("email");
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
      title={getTranslation("authm--title")}
      subtitle={
        <>
          {getTranslation("modal--with")} <strong>{getTranslation("authm--lore")}</strong>
        </>
      }
      submitText={getTranslation("login")}
      loading={loading}
      onClose={() => setOpen(false)}
      onSubmit={login}
      size="sm"
    >
      <FormField label={getTranslation("authm--email")} required>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          css={fieldStyles}
        />
      </FormField>
      <FormField label={getTranslation("authm--password")} required>
        <InputGroup
          endElement={
            <IconButton
              aria-label="Toggle password"
              size="xs"
              variant="plain"
              color="muted"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <LuEyeOff /> : <LuEye />}
            </IconButton>
          }
        >
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            css={fieldStyles}
          />
        </InputGroup>
      </FormField>
      <Checkbox.Root
        checked={remember}
        onCheckedChange={(e) => setRemember(!!e.checked)}
        colorPalette="yellow"
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>{getTranslation("authm--remember-me")}</Checkbox.Label>
      </Checkbox.Root>
    </Modal>
  );
};

export default AuthModal;
