import { useDropzone, type FileRejection } from "react-dropzone";

type CustomDropzoneProps = {
  onDrop: (acceptedFiles: File[], rejectedFiles: FileRejection[]) => void;
  isUploading: boolean;
};

const CustomDropzone = ({ onDrop, isUploading }: CustomDropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxSize: 1000000,
    onDrop: onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={`grid h-52 w-full max-w-md cursor-pointer place-items-center rounded-md border-2 border-dashed p-2 text-center text-base ${
        isDragActive
          ? "border-blue-300 text-blue-300"
          : "border-gray-400 text-white"
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : isUploading ? (
        <p>Uploading...</p>
      ) : (
        <p>Drag {`'n'`} drop image here, or click to select image</p>
      )}
    </div>
  );
};

export default CustomDropzone;
