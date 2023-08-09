import { useRef, useState } from "react";
import Image from "next/image";

import { BsUpload } from "react-icons/bs";

import "./style.scss";

export const ImageDrop = ({
  width,
  height,
  image,
  setImage,
}: {
  width: string | number;
  height: string | number;
  image: File | null;
  setImage: (image: File | null) => void;
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;

    if (!files.length) {
      return;
    }

    const file = files[0];

    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      alert("Only png and jpeg files are allowed!");
      return;
    }

    setImage(e.dataTransfer.files[0]);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Open file dialog
    inputFile.current?.click();
  };

  return (
    <div
      className="drag-drop"
      onDrop={handleDrop}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      style={{
        border: image ? "1px solid #fff" : "1px dashed #fff",
        alignItems: image ? "flex-start" : "center",
        width: width,
        height: height,
      }}
    >
      <div className="drag-drop--click" onClick={handleClick}></div>
      {image ? (
        <Image
          src={URL.createObjectURL(image)}
          alt="logo"
          width={0}
          height={0}
          sizes="100vw"
          style={{
            width: "100%",
            height: "100%"
          }}
        />
      ) : (
        <BsUpload />
      )}
      <input
        type="file"
        ref={inputFile}
        accept="image/png, image/jpeg"
        onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
      />
    </div>
  );
};

export default ImageDrop;
