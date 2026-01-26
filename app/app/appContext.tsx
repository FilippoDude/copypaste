"use client";

import { createContext, useContext, useRef, useState } from "react";
interface AppContextInterface {}

const AppContext = createContext<AppContextInterface | null>(null);

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextInterface {
  const context = useContext(AppContext);
  if (context == null) {
    throw Error("Context failed!");
  }
  return context;
}
