import { createClient } from "@/lib/supabase/client";

export async function generateCertificatePDF(
  certificateId: string,
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const supabase = createClient();

  const { data: cert, error } = await supabase
    .from("certificates")
    .select(
      `
      id,
      issued_at,
      template_id,
      learning_paths ( title ),
      profiles ( first_name, last_name )
    `,
    )
    .eq("id", certificateId)
    .single();

  if (error || !cert) throw new Error("Certificate not found");

  const pathTitle =
    (cert.learning_paths as { title: string } | null)?.title ??
    "Certificate of Completion";
  const profile = cert.profiles as {
    first_name: string;
    last_name: string;
  } | null;
  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : "Student";
  const issuedDate = new Date(cert.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  if (cert.template_id) {
    const { data: template } = await supabase
      .from("certificate_templates")
      .select("*")
      .eq("id", cert.template_id)
      .single();

    if (template) {
      const { data: imageData } = await supabase.storage
        .from("certificate-templates")
        .download(template.storage_path);

      if (imageData) {
        const imageUrl = URL.createObjectURL(imageData);
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            pdf.addImage(img, "JPEG", 0, 0, pageW, pageH);
            URL.revokeObjectURL(imageUrl);
            resolve();
          };
          img.onerror = reject;
          img.src = imageUrl;
        });

        pdf.setFontSize(template.font_size ?? 36);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          fullName,
          pageW * (template.name_x ?? 0.5),
          pageH * (template.name_y ?? 0.6),
          {
            align: "center",
          },
        );

        pdf.setFontSize((template.font_size ?? 36) * 0.65);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          pathTitle,
          pageW * (template.course_x ?? 0.5),
          pageH * (template.course_y ?? 0.5),
          { align: "center" },
        );
        pdf.text(
          issuedDate,
          pageW * (template.date_x ?? 0.5),
          pageH * (template.date_y ?? 0.75),
          { align: "center" },
        );

        return pdf.output("blob");
      }
    }
  }

  // Fallback: text-only certificate if no template is configured
  pdf.setFillColor(254, 252, 232);
  pdf.rect(0, 0, pageW, pageH, "F");

  pdf.setDrawColor(202, 138, 4);
  pdf.setLineWidth(3);
  pdf.rect(8, 8, pageW - 16, pageH - 16, "S");

  pdf.setFontSize(36);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 41, 59);
  pdf.text("Certificate of Completion", pageW / 2, 50, { align: "center" });

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(71, 85, 105);
  pdf.text("This certifies that", pageW / 2, 75, { align: "center" });

  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(15, 23, 42);
  pdf.text(fullName, pageW / 2, 100, { align: "center" });

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(71, 85, 105);
  pdf.text("has successfully completed", pageW / 2, 120, { align: "center" });

  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 41, 59);
  pdf.text(pathTitle, pageW / 2, 145, { align: "center" });

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Issued on ${issuedDate}`, pageW / 2, 170, { align: "center" });

  return pdf.output("blob");
}
