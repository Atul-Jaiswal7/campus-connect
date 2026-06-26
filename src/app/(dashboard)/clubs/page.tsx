import { Card, CardContent } from "@/components/ui/card";

export default function ClubsPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Clubs</h1>
      <Card className="glass-card">
        <CardContent className="py-12 text-center text-muted-foreground">
          Browse college clubs, events, and recruitment opportunities.
        </CardContent>
      </Card>
    </>
  );
}
