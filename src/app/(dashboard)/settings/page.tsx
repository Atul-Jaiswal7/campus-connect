import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <Card className="glass-card">
        <CardContent className="py-12 text-center text-muted-foreground">
          Account settings, privacy, and notification preferences.
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
