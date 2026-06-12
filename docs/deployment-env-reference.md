# Deployment Env Reference

GitHub Actions에서 Vercel 배포를 실행하고 Discord로 결과를 보내기 위해 필요한 설정 목록입니다.
실제 secret 값은 이 파일에 기록하지 않습니다.

## File Strategy

env 관련 파일은 다음 기준으로 관리합니다.

```text
.env.local
.env.example
docs/deployment-env-reference.md
```

### `.env.local`

로컬 개발용 실제 값입니다.

주의:

- Git에 커밋하지 않습니다.
- 개발 머신에서만 사용합니다.
- Production 배포 값과 반드시 같을 필요는 없습니다.

### `.env.example`

앱 실행에 필요한 런타임 env 템플릿입니다.

포함 기준:

- Next.js 앱 코드가 직접 참조하는 env만 둡니다.
- GitHub Actions, Discord, Vercel CLI 전용 secret은 넣지 않습니다.
- 값은 예시 placeholder만 사용합니다.

### `docs/deployment-env-reference.md`

운영자가 읽는 배포/환경변수 기준 문서입니다.

포함 기준:

- GitHub Actions secrets
- Vercel runtime env
- 외부 서비스 설정 방법
- 배포 전환 시 주의점

파일을 서비스별로 과도하게 나누지 않습니다.
기계가 읽는 템플릿은 `.env.example` 하나로 유지하고, 운영 설명은 이 문서 하나에서 관리합니다.

## GitHub Actions Secrets

GitHub repository secrets에 저장합니다.

```text
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
DISCORD_WEBHOOK_URL=
```

### VERCEL_TOKEN

GitHub Actions가 Vercel CLI를 실행할 때 사용하는 Vercel Access Token입니다.

권장:

- Vercel Account Settings에서 CI 전용 토큰을 새로 생성합니다.
- 이름 예시: `GitHub Actions - admin.dinn deploy`
- 자동 생성된 브라우저/대시보드 세션 토큰은 사용하지 않습니다.

### VERCEL_ORG_ID

Vercel account/team 식별자입니다.

확인 방법:

```bash
vercel link
cat .vercel/project.json
```

`project.json`의 `orgId` 값을 사용합니다.

### VERCEL_PROJECT_ID

Vercel project 식별자입니다.

확인 방법:

```bash
vercel link
cat .vercel/project.json
```

`project.json`의 `projectId` 값을 사용합니다.

### DISCORD_WEBHOOK_URL

배포 성공/실패 알림을 받을 Discord 채널 Webhook URL입니다.

주의:

- URL 자체가 쓰기 권한을 가진 secret입니다.
- Git에 커밋하지 않습니다.

## Vercel Runtime Environment Variables

Vercel Project Settings의 Environment Variables에 저장합니다.
Production 배포에서 앱이 런타임에 사용하는 값입니다.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAIL=

GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=

WEBHOOK_SECRET=
NEXT_PUBLIC_SERVICE_DINN_DEV_DOMAIN=

SLACK_WEBHOOK_URL=
```

### Supabase

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

역할:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL입니다.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 브라우저/일반 클라이언트용 anon key입니다.
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용 service role key입니다.

주의:

- `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출되면 안 됩니다.
- Vercel에는 server-side env로만 등록합니다.

### Authentication

```text
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAIL=
```

역할:

- `AUTH_SECRET`: NextAuth 세션/토큰 서명용 secret입니다.
- `GOOGLE_CLIENT_ID`: Google OAuth client id입니다.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret입니다.
- `ADMIN_EMAIL`: 로그인 허용 관리자 이메일입니다.

주의:

- Google OAuth redirect URI는 배포 도메인 기준으로 Vercel production URL과 맞아야 합니다.

### Google Indexing

```text
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
```

역할:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google service account의 client email입니다.
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: Google service account private key입니다.

주의:

- private key는 줄바꿈을 `\n` 형태로 보존해서 등록합니다.
- Search Console에서 해당 service account가 사이트 소유권 권한을 가져야 합니다.

### Webhooks

```text
WEBHOOK_SECRET=
NEXT_PUBLIC_SERVICE_DINN_DEV_DOMAIN=
```

역할:

- `WEBHOOK_SECRET`: Supabase webhook이 `/api/webhooks/indexing` 호출 시 사용하는 검증 secret입니다.
- `NEXT_PUBLIC_SERVICE_DINN_DEV_DOMAIN`: 공개 dinn.dev 서비스 도메인입니다.

주의:

- Supabase webhook 설정의 secret 값과 `WEBHOOK_SECRET`이 일치해야 합니다.
- `NEXT_PUBLIC_SERVICE_DINN_DEV_DOMAIN`은 예: `https://dinn.dev` 형식입니다.

### Slack

```text
SLACK_WEBHOOK_URL=
```

역할:

- 기존 Slack Incoming Webhook 알림용입니다.

주의:

- Discord 배포 알림 전환 후에도 앱 내부 Slack 알림을 유지할지 결정해야 합니다.
- 제거할 경우 `lib/slack.ts`, `scripts/test-slack.ts` 사용처도 함께 정리합니다.

## Check Before Switching Deployment

배포 주체를 GitHub Actions로 바꾸기 전에 확인합니다.

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
DISCORD_WEBHOOK_URL
```

위 4개가 GitHub repository secrets에 있어야 합니다.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
ADMIN_EMAIL
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
WEBHOOK_SECRET
NEXT_PUBLIC_SERVICE_DINN_DEV_DOMAIN
```

위 값들이 Vercel production environment에 있어야 합니다.

## Deployment Ownership

GitHub Actions가 Vercel production 배포를 맡으면 Vercel Git Integration 자동 배포와 중복될 수 있습니다.

권장:

- Vercel project의 Git 자동 배포를 끄거나 무시 설정을 적용합니다.
- production 배포는 GitHub Actions workflow 하나만 담당하게 합니다.

## Workflow Build Mode

GitHub Actions workflow는 `vercel deploy --prod`로 Vercel 원격 빌드를 실행합니다.

이유:

- Vercel의 sensitive/encrypted runtime env는 로컬 `vercel build`에 실제 값이 내려오지 않을 수 있습니다.
- 원격 빌드를 사용하면 Vercel Production Environment Variables가 Vercel 빌드 환경에서 직접 주입됩니다.
- GitHub Actions는 배포 트리거와 Discord 알림만 담당하고, 실제 Next.js production build는 Vercel이 수행합니다.

## Final Env List

### GitHub Actions Secrets

```text
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
DISCORD_WEBHOOK_URL=
```

### Vercel Runtime Env

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAIL=

GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=

WEBHOOK_SECRET=
NEXT_PUBLIC_SERVICE_DINN_DEV_DOMAIN=

SLACK_WEBHOOK_URL=
```
