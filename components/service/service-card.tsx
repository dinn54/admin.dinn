import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layers01Icon } from "@hugeicons/core-free-icons";

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive" | "Draft";
  thumbnail?: string;
  icon?: any;
}

export function ServiceCard({
  id,
  name,
  description,
  status,
  thumbnail,
  icon,
}: ServiceCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 pt-0">
      <div className="aspect-video w-full bg-secondary/30 flex items-center justify-center relative overflow-hidden group-hover:bg-secondary/50 transition-colors">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-primary/40 group-hover:text-primary/60 transition-colors">
            <HugeiconsIcon icon={icon || Layers01Icon} size={64} />
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
          {name}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-[2.5rem]">
          {description}
        </p>
      </CardContent>

      <CardFooter>
        <Button
          variant="secondary"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
          asChild
        >
          <Link
            href={`/services/${encodeURIComponent(name)}?id=${id}&active=${
              status === "Active"
            }`}
          >
            관리하기
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
