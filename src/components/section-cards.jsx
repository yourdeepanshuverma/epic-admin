import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SectionCards({ items = [], loading = false }) {
  const skeletonItems = Array(4).fill(0); // 4 skeleton boxes same layout

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {(loading ? skeletonItems : items).map((item, i) => (
        <Card className="@container/card" key={i}>
          <CardHeader>
            {loading ? (
              <>
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="mb-3 h-7 w-20" />
                <Skeleton className="h-5 w-16" />
              </>
            ) : (
              <>
                <CardDescription>{item.title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {item.value}
                </CardTitle>

                <CardAction>
                  <Badge variant="outline">
                    {item.trend === "up" ? (
                      <IconTrendingUp />
                    ) : (
                      <IconTrendingDown />
                    )}
                    {item.change}
                  </Badge>
                </CardAction>
              </>
            )}
          </CardHeader>

          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {loading ? (
              <>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-1 h-4 w-32" />
              </>
            ) : (
              <>
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {item.footerText}
                  {item.trend === "up" ? (
                    <IconTrendingUp className="size-4" />
                  ) : (
                    <IconTrendingDown className="size-4" />
                  )}
                </div>

                <div className="text-muted-foreground">{item.subText}</div>
              </>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
