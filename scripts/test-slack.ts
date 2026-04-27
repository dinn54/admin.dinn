import { config } from "dotenv";
config({ path: ".env.local" });

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

if (!SLACK_WEBHOOK_URL) {
  console.error("❌ SLACK_WEBHOOK_URL이 설정되지 않았습니다.");
  process.exit(1);
}

const COLOR_MAP = {
  green:  { hex: "#36a64f", emoji: "🟢" },
  yellow: { hex: "#f2c744", emoji: "🟡" },
  red:    { hex: "#e01e5a", emoji: "🔴" },
} as const;

async function send(text: string, color: keyof typeof COLOR_MAP) {
  const { hex, emoji } = COLOR_MAP[color];
  const res = await fetch(SLACK_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attachments: [{ color: hex, text: `${emoji} ${text}` }],
    }),
  });
  console.log(`[${color}] ${text} → ${res.status}`);
}

async function main() {
  console.log("Slack 테스트 알림 전송 중...\n");
  await send("글 등록: 테스트 포스트 (published)", "green");
  await send("글 수정: 테스트 포스트 (published)", "yellow");
  await send("글 삭제: 테스트 포스트", "red");
  console.log("\n✅ 완료");
}

main();
