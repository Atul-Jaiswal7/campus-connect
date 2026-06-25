import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <Card className="glass-card">
        <CardContent className="py-12 text-center text-muted-foreground">
          Profile page — edit your professional student profile here.
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
