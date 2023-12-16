import { useEffect } from "react";
import { useMarketsDataStore } from "../stores/markets-store";
import { generateClient } from "aws-amplify/api";
import { onTransformedData } from "../../appsync/subscriptions";

const amplifyClient = generateClient();

export const useEventSubscription = () => {
  const [eventsData, saveNewEvent] = useMarketsDataStore((state) => [state.events.data, state.events.saveNewEvent]);

  useEffect(() => {
    console.log("Subscribing to onTransformedData... ");
    const sub = amplifyClient.graphql({ query: onTransformedData }).subscribe({
      error: (error: Error) => console.error("onTransformedData Subscription Err:: ", error),
      next: ({ data }) => {
        if (data?.onTransformedData) {
          saveNewEvent(data.onTransformedData);
        }
      },
    });
    return () => {
      sub.unsubscribe();
      console.log("onTransformedData unsubscribed");
    };
  }, [saveNewEvent]);

  return eventsData;
};
