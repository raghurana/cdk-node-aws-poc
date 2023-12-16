import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface State {
  auth: {
    email: string | null;
    setEmail: (email: string | null) => void;
  };
  graphQl: {
    isConnected: boolean;
    setIsConnected: (isConnected: boolean) => void;
  };
}

export const useAppStore = create(
  immer<State>((set) => ({
    auth: {
      email: null,
      setEmail: (email: string | null) => {
        set((state) => {
          state.auth.email = email;
        });
      },
    },
    graphQl: {
      isConnected: false,
      setIsConnected: (isConnected: boolean) => {
        set((state) => {
          state.graphQl.isConnected = isConnected;
        });
      },
    },
  }))
);
