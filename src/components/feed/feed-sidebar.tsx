import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Eye } from "lucide-react";

export function FeedSidebar() {
  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Complete your profile</span>
              <span className="font-semibold text-linkedin">60%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div className="h-2 w-[60%] rounded-full bg-linkedin" />
            </div>
            <Link href="/profile/edit">
              <Button variant="outline" size="sm" className="w-full mt-2">
                Complete Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            Trending Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {["hackathon2024", "react", "placement", "internship", "opensource"].map(
            (tag) => (
              <Link
                key={tag}
                href={`/search?q=${tag}`}
                className="block text-sm text-linkedin hover:underline"
              >
                #{tag}
              </Link>
            )
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            Suggested Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Alex Kumar", dept: "CSE", year: 3 },
            { name: "Priya Sharma", dept: "IT", year: 2 },
            { name: "Rahul Patel", dept: "ECE", year: 4 },
          ].map((person) => (
            <div key={person.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-linkedin text-white">
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{person.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {person.dept} • Year {person.year}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Eye className="h-4 w-4" />
            Campus Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { rank: 1, name: "Dev Club", score: 1250 },
            { rank: 2, name: "AI Society", score: 980 },
            { rank: 3, name: "Code Warriors", score: 870 },
          ].map((item) => (
            <div key={item.rank} className="flex items-center justify-between text-sm">
              <span>
                <span className="font-bold text-linkedin mr-2">#{item.rank}</span>
                {item.name}
              </span>
              <span className="text-muted-foreground">{item.score} pts</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
