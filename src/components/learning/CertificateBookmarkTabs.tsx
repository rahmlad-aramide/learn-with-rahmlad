"use client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Bookmark } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import Button from "@/components/ui/button/Button";

interface UserStats {
  totalPathsStarted: number;
  totalCourses: number;
  totalResourcesCompleted: number;
  bookmarkedCount: number;
}

interface LearningPath {
  id: string;
  title: string;
  slug: string;
  difficulty_level: string;
}

export function CertificateAndBookmarkTabs() {
  const [stats, setStats] = useState<UserStats>({
    totalPathsStarted: 0,
    totalCourses: 0,
    totalResourcesCompleted: 0,
    bookmarkedCount: 0,
  });
  const [bookmarkedResources, setBookmarkedResources] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  return (
    <div className="flex w-full flex-col gap-6">
      {/* Tabs */}
      <Tabs defaultValue="certificates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="mt-6 space-y-6">
          {certificates.length === 0 ? (
            <Card className="p-12 text-center">
              <Award className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground mb-4">
                No certificates earned yet
              </p>
              <Link href="/browse">
                <Button>Start a Learning Path</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {certificates.map((cert) => (
                <Card key={cert.id} className="p-6">
                  <div className="flex items-center gap-4">
                    <Award className="text-primary h-12 w-12" />
                    <div>
                      <h3 className="font-bold">Certificate Earned</h3>
                      <p className="text-muted-foreground text-sm">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-6 space-y-6">
          {bookmarkedResources.length === 0 ? (
            <Card className="p-12 text-center">
              <Bookmark className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground mb-4">
                No bookmarked resources yet
              </p>
              <Link href="/browse">
                <Button>Browse Resources</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookmarkedResources.map((bookmark) => (
                <Card key={bookmark.id} className="p-4">
                  <p className="font-medium">Bookmarked Resource</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {new Date(bookmark.created_at).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
