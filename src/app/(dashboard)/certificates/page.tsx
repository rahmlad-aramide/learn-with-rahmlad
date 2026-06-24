"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Award, Download } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Certificate {
  id: string;
  issued_at: string;
  learning_paths?: {
    id: string;
    title: string;
  };
}

export default function BlankPage() {
  const [user, setUser] = useState<any>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser) {
      router.push("/signin");
      return;
    }

    setUser(authUser);
    await fetchCertificates(authUser.id);
  };

  const fetchCertificates = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("certificates")
        .select(
          `
          id,
          issued_at,
          learning_paths(
            id,
            title
          )
        `,
        )
        .eq("user_id", userId)
        .order("issued_at", { ascending: false });

      setCertificates(data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  return (
    <div>
      <PageBreadcrumb pageTitle="My Certificates" />
      <div className="mx-auto max-w-7xl pb-12">
        {certificates.length === 0 ? (
          <Card className="p-12 text-center">
            <Award className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground mb-4">
              No certificates earned yet
            </p>
            <p className="text-muted-foreground mb-6 text-sm">
              Complete a learning path to earn your first certificate!
            </p>
            <Link href="/browse">
              <Button>Start a Learning Path</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card
                key={cert.id}
                className="border-primary/20 flex flex-col items-center space-y-4 border-2 p-8 text-center transition-shadow hover:shadow-lg"
              >
                <div className="relative">
                  <Award className="text-primary h-16 w-16" />
                  <div className="bg-primary/10 absolute inset-0 rounded-full blur-xl" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-bold">
                    {cert.learning_paths?.title || "Certificate of Completion"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Earned on{" "}
                    {new Date(cert.issued_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full gap-2 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
