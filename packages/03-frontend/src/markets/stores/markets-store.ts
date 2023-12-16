import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { MarketsDataEvent } from "../interface.ts";

interface State {
  events: {
    data: MarketsDataEvent[];
    saveNewEvent: (event: MarketsDataEvent) => void;
  };
}

export const useMarketsDataStore = create(
  immer<State>((set) => ({
    events: {
      data: [],
      saveNewEvent: (event: MarketsDataEvent) => {
        set((state) => {
          state.events.data.push(event);
        });
      },
    },
  }))
);
