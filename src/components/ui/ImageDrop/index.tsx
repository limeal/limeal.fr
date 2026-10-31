"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Box, Grid, IconButton, Text, VStack } from "@chakra-ui/react";
import { LuTrash2, LuUpload } from "react-icons/lu";

import { toast } from "../Toaster";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

type ImageDropProps = {
  images: Array<File | string> | null;
  setImages: (images: Array<File> | null) => void;
  limit?: number;
  height?: string | number | Record<string, string | number>;
};

export const ImageDrop = ({ images, setImages, limit, height = "200px" }: ImageDropProps) => {
  const [dragActive, setDragActive] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);

  const extractImages = (files: FileList | null): Array<File> | null => {
    if (!files || !files.length) return null;
    return Array.from(files).slice(0, limit ?? undefined);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDrag(e);
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (!files.length) return;

    if (Array.from(files).some((file) => !ACCEPTED.includes(file.type))) {
      toast.error("Only png, jpeg and webp files are allowed!");
      return;
    }

    setImages(extractImages(files));
  };

  const shown = images?.slice(0, 4) ?? [];
  const hiddenCount = images ? images.length - 4 : 0;

  return (
    <Box
      position="relative"
      h={height}
      w="full"
      borderRadius="12px"
      borderWidth="1px"
      borderStyle={images ? "solid" : "dashed"}
      borderColor={dragActive ? "lime" : "whiteAlpha.500"}
      bg="ink"
      cursor="pointer"
      overflow="hidden"
      onDrop={handleDrop}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onClick={() => inputFile.current?.click()}
    >
      {images ? (
        <Grid h="full" templateColumns={shown.length > 1 ? "repeat(2, 1fr)" : "1fr"} gap="1">
          {shown.map((image, index) => (
            <Box key={index} position="relative" minH="0">
              <Image
                src={typeof image === "string" ? image : URL.createObjectURL(image)}
                alt=""
                fill
                sizes="400px"
                style={{
                  objectFit: "contain",
                  opacity: index === 3 && hiddenCount > 0 ? 0.3 : 1,
                }}
              />
              {index === 3 && hiddenCount > 0 && (
                <Text position="absolute" inset="0" display="grid" placeItems="center" fontWeight="black" fontSize="2xl">
                  +{hiddenCount}
                </Text>
              )}
            </Box>
          ))}
        </Grid>
      ) : (
        <VStack h="full" justify="center" color="muted" fontSize="2xl">
          <LuUpload />
        </VStack>
      )}
      {images && (
        <IconButton
          aria-label="Clear"
          size="sm"
          position="absolute"
          top="2"
          right="2"
          bg="rose"
          color="white"
          borderRadius="pill"
          onClick={(e) => {
            e.stopPropagation();
            setImages(null);
          }}
        >
          <LuTrash2 />
        </IconButton>
      )}
      <input
        type="file"
        ref={inputFile}
        hidden
        accept={ACCEPTED.join(", ")}
        multiple={limit ? limit > 1 : true}
        onChange={(e) => setImages(extractImages(e.target.files))}
      />
    </Box>
  );
};

export default ImageDrop;
