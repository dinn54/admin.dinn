const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

type SlackColor = "green" | "yellow" | "red";

const COLOR_MAP: Record<SlackColor, { hex: string; emoji: string }> = {
  green:  { hex: "#36a64f", emoji: "🟢" },
  yellow: { hex: "#f2c744", emoji: "🟡" },
  red:    { hex: "#e01e5a", emoji: "🔴" },
};

export function notifySlack(text: string, color: SlackColor) {
  if (!SLACK_WEBHOOK_URL) return;
  const { hex, emoji } = COLOR_MAP[color];
  fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attachments: [{ color: hex, text: `${emoji} ${text}` }],
    }),
  }).catch((err) => console.error("[Slack] 알림 전송 실패:", err));
}
