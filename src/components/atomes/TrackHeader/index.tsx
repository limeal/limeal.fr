"use client";

import Image from "next/image";
import "./style.scss";

const TrackHeader = () => {

  return (
    <div className="track-header">
      <Image
          height={50}
          width={50}
          src={"/assets/images/no-image.png"}
          alt="profile"
        />
    </div>
  );
};

export default TrackHeader;
