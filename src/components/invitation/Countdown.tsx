import { useEffect, useState } from "react";
import { COUPLE, t } from "@/lib/i18n";

function diff(targetMs: number) {
  const now = Date.now();
  const d = Math.max(0, targetMs - now);
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d / 3600000) % 24),
    minutes: Math.floor((d / 60000) % 60),
    seconds: Math.floor((d / 1000) % 60),
    done: d === 0,
  };
}

export default function Countdown() {
  const target = new Date(COUPLE.dateISO).getTime();
  const [time, setTime] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setTime(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (time.done) {
    return <p className="countdown-done">{t.invite.theBigDay}</p>;
  }

  const units = [
    { value: time.days, label: t.invite.days },
    { value: time.hours, label: t.invite.hours },
    { value: time.minutes, label: t.invite.minutes },
    { value: time.seconds, label: t.invite.seconds },
  ];

  return (
    <div className="countdown">
      {units.map((u) => (
        <div className="countdown-unit" key={u.label}>
          <span className="countdown-value">{String(u.value).padStart(2, "0")}</span>
          <span className="countdown-label">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
