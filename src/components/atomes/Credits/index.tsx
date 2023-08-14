"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import "./style.scss";
import { useLangContext } from "@/contexts/LangContext";

const Credits = () => {
  const { user } = useAuthContext();
  const { getTranslation } = useLangContext();

  return (
    <div className="credits">
      <p>{getTranslation("credits--develop-by")}: {user ? "Paul G." : "Limeal"}</p>
      <p>{getTranslation("credits--design-by")}: Syarhu M</p>
    </div>
  );
};

export default Credits;
