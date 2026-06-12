import { config } from "dotenv";

config({ path: ".env.local" });

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL) {
  console.error("DISCORD_WEBHOOK_URL이 설정되지 않았습니다.");
  process.exit(1);
}

interface TestField {
  name: string;
  value: string;
  inline?: boolean;
}

async function send(
  title: string,
  description: string,
  color: number,
  fields: TestField[],
) {
  const res = await fetch(DISCORD_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title,
          description,
          color,
          fields,
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  console.log(`${title} -> ${res.status}`);
}

async function main() {
  console.log("Discord 테스트 알림 전송 중...\n");
  await send("✅ 🚀 글 출간 완료", "테스트 포스트", 0x22c55e, [
    { name: "상태", value: "draft → published", inline: true },
    { name: "경로", value: "/posts/test", inline: false },
    { name: "Post ID", value: "notification-test", inline: false },
  ]);
  await send("✅ 🙈 숨김 글 등록 완료", "테스트 포스트", 0x22c55e, [
    { name: "상태", value: "unlisted", inline: true },
    { name: "경로", value: "/posts/test", inline: false },
    { name: "Post ID", value: "notification-test", inline: false },
  ]);
  await send("✅ 📝 초안 저장 완료", "테스트 포스트", 0x22c55e, [
    { name: "상태", value: "draft", inline: true },
    { name: "경로", value: "/posts/test", inline: false },
    { name: "Post ID", value: "notification-test", inline: false },
  ]);
  await send("✅ ✏️ 글 수정 완료", "테스트 포스트", 0x22c55e, [
    { name: "상태", value: "published", inline: true },
    { name: "경로", value: "/posts/test", inline: false },
    { name: "Post ID", value: "notification-test", inline: false },
  ]);
  await send("✅ 🗑️ 글 삭제 완료", "테스트 포스트", 0x22c55e, [
    { name: "상태", value: "published", inline: true },
    { name: "경로", value: "/posts/test", inline: false },
    { name: "Post ID", value: "notification-test", inline: false },
  ]);
  await send("❌ 🔎 인덱싱 수정 요청 실패", "/posts/test", 0xef4444, [
    { name: "요청 타입", value: "URL_UPDATED", inline: true },
    { name: "원인", value: "글 수정", inline: true },
    { name: "경로", value: "/posts/test", inline: false },
    { name: "오류", value: "Permission denied", inline: false },
  ]);
  console.log("\n완료");
}

main();
