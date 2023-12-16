import { Hub } from "aws-amplify/utils";
import { CONNECTION_STATE_CHANGE, ConnectionState } from "aws-amplify/api";
import { useAppStore } from "./App.store";
import { useEffect } from "react";

export const useAppSyncHubConnectionInfo = () => {
  const [isConnected, setIsConnected] = useAppStore((s) => [s.graphQl.isConnected, s.graphQl.setIsConnected]);

  useEffect(() => {
    const stopCallback = Hub.listen(
      "api",
      (data) => {
        const { payload } = data;
        if (payload.event === CONNECTION_STATE_CHANGE) {
          const eventData = payload.data as { connectionState: ConnectionState };
          setIsConnected(eventData.connectionState === ConnectionState.Connected);
        }
      },
      "AppSyncHubConnectionInfo"
    );
    return () => {
      stopCallback();
    };
  }, [setIsConnected]);

  return isConnected;
};
