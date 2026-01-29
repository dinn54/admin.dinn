import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  onIconClick?: () => void;
}

export function SummaryCard({ title, value, icon, description, onIconClick }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {onIconClick ? (
          <button
            onClick={onIconClick}
            className="p-1 -m-1 rounded-md hover:bg-muted transition-colors"
            title="최신 글 수정"
          >
            <HugeiconsIcon icon={icon} className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        ) : (
          <HugeiconsIcon icon={icon} className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
