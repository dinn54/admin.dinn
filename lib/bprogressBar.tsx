"use client";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";

const BProgressBar = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height="3px"
      color="#032254"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};
export default BProgressBar;
