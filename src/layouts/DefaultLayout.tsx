import { type ReactNode } from "react";

// external imports
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const DefaultLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default DefaultLayout;
