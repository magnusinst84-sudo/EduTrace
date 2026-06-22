import jsPDF from 'jspdf';

export function exportRoadmapPDF(roadmap, topic, level) {
  const doc = new jsPDF();

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = margin;

  const checkPageBreak = (requiredSpace) => {
    if (y + requiredSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(`${topic} Learning Roadmap`, margin, y);
  y += 10;

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  const totalWeeks = roadmap.length;
  const levelText = level ? `${level} Level` : "Personalized Level";
  doc.text(`${levelText} • ${totalWeeks} Weeks`, margin, y);
  doc.setTextColor(0, 0, 0);
  y += 20;

  // Render each week
  roadmap.forEach((week) => {
    checkPageBreak(30);

    // Week Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Week ${week.week}: ${week.topic}`, margin, y);
    y += 8;

    // Goal
    if (week.goal) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      const splitGoal = doc.splitTextToSize(`Goal: ${week.goal}`, pageWidth - margin * 2);
      checkPageBreak(splitGoal.length * 6);
      doc.text(splitGoal, margin, y);
      doc.setTextColor(0, 0, 0);
      y += splitGoal.length * 6 + 4;
    }

    // Concepts
    if (week.concepts && week.concepts.length > 0) {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Key Concepts:", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      week.concepts.forEach(concept => {
        const splitConcept = doc.splitTextToSize(`• ${concept}`, pageWidth - margin * 2 - 5);
        checkPageBreak(splitConcept.length * 6);
        doc.text(splitConcept, margin + 5, y);
        y += splitConcept.length * 6;
      });
      y += 4;
    }

    // Resources
    if (week.resources && week.resources.length > 0) {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Resources:", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      week.resources.forEach(resource => {
        const titleText = `• ${resource.title || resource.url} [${resource.type || 'Link'}]`;
        const splitResource = doc.splitTextToSize(titleText, pageWidth - margin * 2 - 5);

        checkPageBreak(splitResource.length * 6);

        if (resource.url) {
          doc.setTextColor(37, 99, 235);
          // textWithLink only takes a string, use first line only
          doc.textWithLink(splitResource[0], margin + 5, y, { url: resource.url });
          // render remaining lines as plain text if any
          if (splitResource.length > 1) {
            doc.text(splitResource.slice(1), margin + 5, y + 6);
          }
        } else {
          doc.setTextColor(0, 0, 0);
          doc.text(splitResource, margin + 5, y);
        }

        y += splitResource.length * 6;
      });
      doc.setTextColor(0, 0, 0);
      y += 4;
    }

    y += 10; // Extra spacing before next week
  });

  const filename = `${topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}-roadmap.pdf`;
  doc.save(filename);
}
