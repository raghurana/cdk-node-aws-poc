import { useAuthenticator } from "@aws-amplify/ui-react";
import { useEventSubscription } from "../hooks/use-events-subscription";
import styles from "./dashboard.module.css";
import { TradeEvent } from "./trade-event";
import { useEffect } from "react";
import { useAppStore } from "../../App.store";
import { useAppSyncHubConnectionInfo } from "../../App.hooks";

export const Dashboard: React.FC = () => {
  const events = useEventSubscription();
  const isConnected = useAppSyncHubConnectionInfo();
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const { email, setEmail } = useAppStore((s) => s.auth);

  useEffect(() => {
    if (user?.signInDetails) setEmail(user.signInDetails.loginId ?? user.userId);
  }, [user, email, setEmail]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.title}>Dashboard {isConnected ? "🔥" : ""} </span>
          <div>Welcome, {email}</div>
        </div>
        <span className={styles.spacer} />
        <button onClick={signOut}>Sign out</button>
      </div>

      <div className={styles.content}>
        {events.length === 0 && <span className={styles.nocontent}>No events yet</span>}
        {events.length > 0 && events.map((e) => <TradeEvent key={e.ledgerId} event={e} />)}
      </div>
    </div>
  );
};
