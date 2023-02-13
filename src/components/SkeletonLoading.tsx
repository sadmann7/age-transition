import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SkeletonLoading = () => {
  return (
    <Skeleton
      baseColor="#3b3b3b"
      highlightColor="#626262"
      borderRadius={6}
      className="h-full w-full"
    />
  );
};

export default SkeletonLoading;
