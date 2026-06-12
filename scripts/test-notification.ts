import { config } from "dotenv";

config({ path: ".env.local" });

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL) {
  console.error("DISCORD_WEBHOOK_URL이 설정되지 않았습니다.");
  process.exit(1);
}

async function send(title: string, description: string, color: number) {
  const res = await fetch(DISCORD_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title,
          description,
          color,
          fields: [
            { name: "브랜치", value: "local", inline: true },
            { name: "실행자", value: "notification-test", inline: true },
          ],
        },
      ],
    }),
  });

  console.log(`${title} -> ${res.status}`);
}

async function main() {
  console.log("Discord 테스트 알림 전송 중...\n");
  await send("성공: 글 등록", "테스트 포스트 (published)", 0x22c55e);
  await send("주의: 글 수정", "테스트 포스트 (published)", 0xf2c744);
  await send("실패: 인덱싱 요청 실패", "/posts/test\nPermission denied", 0xef4444);
  console.log("\n완료");
}

main();
