type NotificationLevel = "success" | "warning" | "error";

interface NotificationField {
  name: string;
  value: string;
  inline?: boolean;
}

interface NotificationPayload {
  title: string;
  message?: string;
  level: NotificationLevel;
  fields?: NotificationField[];
}

interface NotificationChannel {
  name: string;
  send(payload: NotificationPayload): Promise<void>;
}

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const LEVEL_META: Record<NotificationLevel, { color: number; label: string }> = {
  success: { color: 0x22c55e, label: "성공" },
  warning: { color: 0xf2c744, label: "주의" },
  error: { color: 0xef4444, label: "실패" },
};

const channels: NotificationChannel[] = [
  {
    name: "discord",
    async send(payload) {
      if (!DISCORD_WEBHOOK_URL) return;

      const meta = LEVEL_META[payload.level];
      const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `${meta.label}: ${payload.title}`,
              description: payload.message,
              color: meta.color,
              fields: payload.fields,
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Discord webhook failed with status ${res.status}`);
      }
    },
  },
];

export function notify(payload: NotificationPayload) {
  void Promise.allSettled(channels.map((channel) => channel.send(payload))).then(
    (results) => {
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `[Notification:${channels[index].name}] 알림 전송 실패:`,
            result.reason,
          );
        }
      });
    },
  );
}
