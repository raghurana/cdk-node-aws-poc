import { MarketsDataEvent } from "../interface";
import styles from "./trade-event.module.css";

interface Props {
  event: MarketsDataEvent;
}

export const TradeEvent: React.FC<Props> = ({ event }) => {
  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <label>Trade Event :: </label>
        {event.tradeEvent}
        <br />
        <label>Timestamp :: </label>
        {convertUtcToLocal(event.timestampUtc)}
        <br />
        <label>Ledger Id :: </label>
        {event.ledgerId}
        <br />
        {convertJsonToTable(event.eventDataJson)}
      </div>
    </div>
  );
};

const convertUtcToLocal = (dateString: string) => {
  const date = new Date(dateString);
  const localDate = date.toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
  const localTime = date.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return `${localDate} ${localTime}`;
};

const convertJsonToTable = (json: string) => {
  const obj = JSON.parse(json);
  return (
    <table>
      <tbody>
        {Object.keys(obj).map((key) => (
          <tr key={key}>
            <td className={styles.tableKey}>{key} :: </td>
            <td>{obj[key]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
