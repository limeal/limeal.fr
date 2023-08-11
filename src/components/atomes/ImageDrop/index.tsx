import { useRef, useState } from "react";
import Image from "next/image";

import { BsUpload } from "react-icons/bs";

import "./style.scss";

export const ImageDrop = ({
  width,
  height,
  images,
  setImages,
  limit,
}: {
  width: string | number;
  height: string | number;
  images: Array<File> | null;
  setImages: (images: Array<File> | null) => void;
  limit?: number;
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const extractImages = (files: FileList | null): Array<File> | null => {
    if (!files) return null;

    const images: Array<File> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) images.push(file);
    }

    console.log("Extracted File: ", images);
    console.log("After Extracted File: ", images.slice(0, limit ?? undefined));
    return images.slice(0, limit ?? undefined);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;

    if (!files.length) {
      return;
    }

    for (const file of files) {
      if (
        file.type !== "image/png" &&
        file.type !== "image/jpeg" &&
        file.type !== "image/webp"
      ) {
        alert("Only png, jpeg and webp files are allowed!");
        return;
      }
    }

    setImages(extractImages(files));
    console.log("Dropped File: ", images);
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
        border: images ? "1px solid #fff" : "1px dashed #fff",
        alignItems: images ? "flex-start" : "center",
        width: width,
        height: height,
      }}
    >
      <div className="drag-drop--click" onClick={handleClick}></div>
      {images ? (
        <ul
          ref={list}
          style={{
            display: images.length > 1 ? "grid" : "initial",
            gridTemplateColumns:
              images.length >= 2 ? "repeat(2, 1fr)" : "initial",
          }}
        >
          {images.slice(0, 4).map((image, index) => (
            <li key={index} style={{
              height: "100%",
              position: "relative",
              maxHeight: images.length > 2  && list.current?.clientHeight ? list.current?.clientHeight / 2 : list.current?.clientHeight,
            }}>
              <Image
                key={index}
                src={URL.createObjectURL(image)}
                alt="logo"
                width={0}
                height={0}
                sizes="100vw"
                style={{
                  width: "100%",
                  height: "inherit",
                  objectFit: "contain",
                  opacity: index === 3 && images.length > 4 ? 0.3 : 1,
                }}
              />
              {images.length > 4 && index === 3 && <span>+{images.length - 4}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <BsUpload />
      )}
      <input
        type="file"
        ref={inputFile}
        accept="image/png, image/jpeg, image/webp"
        multiple={limit ? limit > 1 : true}
        onChange={(e) => setImages(extractImages(e.target.files))}
      />
    </div>
  );
};

export default ImageDrop;
