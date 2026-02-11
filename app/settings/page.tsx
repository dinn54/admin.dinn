import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground">전역 시스템 환경설정 및 계정 설정을 구성합니다.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>시스템 프로필</CardTitle>
            <CardDescription>관리자 시스템에 대한 일반 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 opacity-50 pointer-events-none select-none">
            <div className="grid gap-2">
              <Label htmlFor="system-name">시스템 이름</Label>
              <Input id="system-name" defaultValue="Admin Dinn" disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-email">관리자 이메일</Label>
              <Input id="admin-email" defaultValue="joodinner@gmail.com" disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>알림</CardTitle>
            <CardDescription>수신할 알림을 제어합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 opacity-50 pointer-events-none select-none">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>이메일 알림</Label>
                <p className="text-[0.625rem]/relaxed text-muted-foreground">매일 요약을 이메일로 받습니다.</p>
              </div>
              <Switch disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>시스템 경고</Label>
                <p className="text-[0.625rem]/relaxed text-muted-foreground">치명적인 시스템 이벤트에 대한 실시간 경고를 받습니다.</p>
              </div>
              <Switch disabled />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled>기본값으로 재설정</Button>
          <Button disabled>구성 저장</Button>
        </div>
      </div>
    </div>
  );
}
