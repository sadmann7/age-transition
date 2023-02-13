import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FileRejection } from "react-dropzone";
import { toast } from "react-toastify";
import { NextPageWithLayout } from "./_app";

// external imports
import Button from "@/components/Button";
import CustomDropzone from "@/components/CustomDropzone";
import SkeletonLoading from "@/components/SkeletonLoading";
import DefaultLayout from "@/layouts/DefaultLayout";
import { Prediction, UploadedFile } from "@/types/globals";
import { downloadFile } from "@/utils/download";

const Home: NextPageWithLayout = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedLoaded, setGeneratedLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) =>
      acceptedFiles.forEach(
        (file) => {
          if (!file) return;
          setIsUploading(true);
          setImageName(file.name);
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            const base64 = reader.result;
            if (typeof base64 !== "string") return;
            const response = await fetch("/api/upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                base64,
              }),
            });

            if (!response.ok) {
              toast.error("Network response was not ok");
            }
            const data: UploadedFile = await response.json();
            if (!data) return;
            setOriginalImage(data.secure_url);
            setIsUploading(false);
            generateImage(data.secure_url);
          };
        },
        rejectedFiles.forEach((file) => {
          if (file.errors[0]?.code === "file-too-large") {
            const size = Math.round(file.file.size / 1000000);
            toast.error(
              `Please upload a image smaller than 1MB. Current size: ${size}MB`
            );
          } else {
            toast.error(toast.error(file.errors[0]?.message));
          }
        })
      ),

    []
  );

  const generateImage = async (imageUrl: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(true);
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
      }),
    });
    let prediction: Prediction = await response.json();

    if (response.status !== 201) {
      toast.error(prediction.error);
      return;
    }
    setGeneratedImage(prediction.output);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        toast.error(prediction.error);
        return;
      }
      setGeneratedImage(prediction.output);
    }

    setIsLoading(false);
  };

  // scroll to loading indicator on image upload
  const loadingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!loadingRef.current) return;
    loadingRef.current.scrollIntoView({ behavior: "smooth" });
  }, [originalImage, isLoading]);

  return (
    <>
      <Head>
        <title>Age Transition</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto my-14 min-h-screen w-full max-w-5xl px-4">
        <div className="grid place-items-center gap-5">
          <h1 className="text-center text-3xl font-bold text-white sm:text-5xl">
            Age transition with AI
          </h1>
          <p className="text-center text-base text-gray-400 sm:text-lg">
            Upload an image of a person and see the transition of their age from
            young to old
          </p>
        </div>
        <AnimatePresence mode="wait">
          <motion.div className="mt-16 grid w-full place-items-center gap-10">
            {!originalImage ? (
              <CustomDropzone isUploading={isUploading} onDrop={onDrop} />
            ) : (
              <div className="flex w-full flex-col items-center gap-5 sm:flex-row">
                <div className="grid w-full place-items-center gap-2 sm:w-1/2">
                  <h2 className="text-lg text-white">Original image</h2>
                  <Image
                    src={originalImage as string}
                    alt={imageName ?? "original"}
                    width={480}
                    height={480}
                    className="rounded-md"
                    priority
                  />
                </div>
                <div className="grid w-full place-items-center gap-2 sm:w-1/2">
                  <h2 className="text-lg text-white">Generated GIF</h2>
                  {generatedImage ? (
                    <Image
                      src={generatedImage}
                      alt={imageName ?? "generated"}
                      width={480}
                      height={480}
                      className="rounded-md"
                      priority
                      onLoadingComplete={() => setGeneratedLoaded(true)}
                    />
                  ) : (
                    <div className="aspect-square w-full">
                      <SkeletonLoading />
                    </div>
                  )}
                </div>
              </div>
            )}
            {generatedLoaded && (
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <Button
                  aria-label="upload another image"
                  onClick={() => {
                    setOriginalImage(null);
                    setGeneratedImage(null);
                    setGeneratedLoaded(false);
                    window.scrollTo(0, 0);
                  }}
                >
                  Upload another image
                </Button>
                <Button
                  aria-label="download image"
                  onClick={async () => {
                    downloadFile(
                      generatedImage as string,
                      imageName?.replace(/\.[^/.]+$/, ".gif") as string,
                      setIsDownloading
                    );
                  }}
                  disabled={isDownloading}
                >
                  {isDownloading ? "Loading..." : "Download GIF"}
                </Button>
              </div>
            )}
            {isLoading && (
              <div
                className="rounded-md bg-white py-1.5 px-4 text-base font-semibold"
                ref={loadingRef}
              >
                Please wait a while the image is being generated
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
};

export default Home;

Home.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
