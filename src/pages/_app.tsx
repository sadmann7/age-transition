import "@/styles/globals.css";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { type ReactElement, type ReactNode } from "react";

// external exports
import ToastWrapper from "@/components/ToastWrapper";
import DefaultLayout from "@/layouts/DefaultLayout";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<
  P,
  IP
> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <>
      <Head>
        <title>Age Transition</title>
      </Head>
      {getLayout(<Component {...pageProps} />)}
      <ToastWrapper />
    </>
  );
}
