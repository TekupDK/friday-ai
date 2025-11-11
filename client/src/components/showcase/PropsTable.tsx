import { Card, CardContent } from "@/components/ui/card";

interface PropItem {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
}

interface PropsTableProps {
  items: PropItem[];
  dense?: boolean;
}

export function PropsTable({ items, dense }: PropsTableProps) {
  return (
    <Card className="border-dashed">
      <CardContent className={dense ? "p-3" : "p-4"}>
        <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground pb-2 border-b">
          <div className="col-span-3">Prop</div>
          <div className="col-span-4">Type</div>
          <div className="col-span-2">Required</div>
          <div className="col-span-3">Default</div>
        </div>
        <div className="divide-y">
          {items.map((p) => (
            <div key={p.name} className="grid grid-cols-12 py-2 gap-2">
              <div className="col-span-3 font-mono text-sm">{p.name}</div>
              <div className="col-span-4 text-xs text-muted-foreground break-words">{p.type}</div>
              <div className="col-span-2 text-xs">{p.required ? "Yes" : "No"}</div>
              <div className="col-span-3 text-xs text-muted-foreground">{p.defaultValue || "-"}</div>
              {p.description && (
                <div className="col-span-12 text-[11px] text-muted-foreground/80">{p.description}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
