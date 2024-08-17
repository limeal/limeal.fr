import { AiFillStar } from "react-icons/ai";

import "./style.scss";

const SkillCard = ({ name, exp }: { name: string; exp: number }) => {
  return (
    <div className="skill-card">
      <span>{name}</span>
      <div>
        <span>
          <strong>{exp}</strong> year{exp > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
};

export default SkillCard;
