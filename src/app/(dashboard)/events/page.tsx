import { Card, CardContent } from "@/components/ui/card";

export default function EventsPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Events</h1>
      <Card className="glass-card">
        <CardContent className="py-12 text-center text-muted-foreground">
          Hackathons, seminars, workshops — RSVP to campus events.
        </CardContent>
      </Card>
    </>
  );
}
