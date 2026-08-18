/**
 * exportUtils.js
 * Utility functions for exporting notes as JPEG (.jpg) and PDF (.pdf) files
 * using client-side HTML5 Canvas rendering.
 */

// Helper to wrap text nicely on canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = text.split("\n");
  let currentY = y;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      currentY += lineHeight;
      continue;
    }

    const words = line.split(" ");
    let currentLine = "";

    for (let w = 0; w < words.length; w++) {
      const testLine = currentLine ? `${currentLine} ${words[w]}` : words[w];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        ctx.fillText(currentLine, x, currentY);
        currentLine = words[w];
        currentY += lineHeight;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      ctx.fillText(currentLine, x, currentY);
      currentY += lineHeight;
    }
  }
  return currentY;
}

// Helper to load image object
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // resolve null if image fails to load
    img.src = src;
  });
}

/**
 * Render single or multiple notes onto a Canvas element
 */
async function renderNotesToCanvas(notesList) {
  const targetNotes = Array.isArray(notesList) ? notesList : [notesList];
  const width = 800;
  const padding = 40;
  const cardGap = 30;

  // Offscreen measurement canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Pre-load all images
  const loadedImages = await Promise.all(
    targetNotes.map((n) => (n.imageUrl ? loadImage(n.imageUrl) : Promise.resolve(null)))
  );

  // Measure total height required
  let totalHeight = padding; // top padding

  targetNotes.forEach((n, idx) => {
    // Card header height
    totalHeight += 90; // Header banner

    // Title & content height measurement
    ctx.font = "normal 16px Inter, system-ui, sans-serif";
    const lines = (n.content || "").split("\n");
    let contentHeight = 0;
    lines.forEach((line) => {
      const words = line.split(" ");
      let currentLine = "";
      words.forEach((w) => {
        const testLine = currentLine ? `${currentLine} ${w}` : w;
        if (ctx.measureText(testLine).width > width - padding * 2 - 40 && currentLine) {
          contentHeight += 24;
          currentLine = w;
        } else {
          currentLine = testLine;
        }
      });
      contentHeight += 24;
    });

    totalHeight += Math.max(contentHeight, 40) + 30; // content + spacing

    // Image height if present
    const img = loadedImages[idx];
    if (img) {
      const maxImgHeight = 350;
      const aspect = img.width / img.height;
      const imgWidth = width - padding * 2 - 40;
      const imgHeight = Math.min(imgWidth / aspect, maxImgHeight);
      totalHeight += imgHeight + 20;
    }

    // Card footer
    totalHeight += 50;

    if (idx < targetNotes.length - 1) {
      totalHeight += cardGap;
    }
  });

  totalHeight += padding; // bottom padding

  // Set real canvas dimensions
  canvas.width = width * 2; // 2x resolution for sharpness
  canvas.height = totalHeight * 2;
  ctx.scale(2, 2);

  // Draw Main Canvas Background
  const gradient = ctx.createLinearGradient(0, 0, width, totalHeight);
  gradient.addColorStop(0, "#0f172a");
  gradient.addColorStop(1, "#1e293b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, totalHeight);

  // App Title Header Banner
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Inter, system-ui, sans-serif";
  ctx.fillText("SlackNotes", padding, padding + 25);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "normal 12px Inter, system-ui, sans-serif";
  ctx.fillText(
    `Exported on ${new Date().toLocaleDateString()} • ${targetNotes.length} Note${targetNotes.length > 1 ? "s" : ""}`,
    padding + 130,
    padding + 23
  );

  let currentY = padding + 55;

  // Draw Each Note Card
  targetNotes.forEach((n, idx) => {
    const cardX = padding;
    const cardWidth = width - padding * 2;
    const img = loadedImages[idx];

    // Measure card height
    ctx.font = "normal 16px Inter, system-ui, sans-serif";
    const lines = (n.content || "").split("\n");
    let contentHeight = 0;
    lines.forEach((line) => {
      const words = line.split(" ");
      let currentLine = "";
      words.forEach((w) => {
        const testLine = currentLine ? `${currentLine} ${w}` : w;
        if (ctx.measureText(testLine).width > cardWidth - 40 && currentLine) {
          contentHeight += 24;
          currentLine = w;
        } else {
          currentLine = testLine;
        }
      });
      contentHeight += 24;
    });

    let cardContentHeight = 110 + Math.max(contentHeight, 40);
    let imgDrawHeight = 0;
    let imgDrawWidth = 0;

    if (img) {
      const maxImgHeight = 350;
      const aspect = img.width / img.height;
      imgDrawWidth = cardWidth - 40;
      imgDrawHeight = Math.min(imgDrawWidth / aspect, maxImgHeight);
      cardContentHeight += imgDrawHeight + 20;
    }

    // Card background
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(cardX, currentY, cardWidth, cardContentHeight, 16);
    ctx.fill();

    // Card border
    ctx.strokeStyle = n.isPinned ? "#10b981" : "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = n.isPinned ? 2 : 1;
    ctx.stroke();

    // Note Header Accent Bar
    const headerGrad = ctx.createLinearGradient(cardX, currentY, cardX + cardWidth, currentY);
    headerGrad.addColorStop(0, "#10b981");
    headerGrad.addColorStop(1, "#3b82f6");
    ctx.fillStyle = headerGrad;
    ctx.beginPath();
    ctx.roundRect(cardX, currentY, cardWidth, 6, [16, 16, 0, 0]);
    ctx.fill();

    // Note Title
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 18px Inter, system-ui, sans-serif";
    const titleText = (n.isPinned ? "📌 " : "") + (n.title || "Untitled Note");
    ctx.fillText(titleText, cardX + 20, currentY + 38);

    // Date & Alarm Badges
    ctx.fillStyle = "#64748b";
    ctx.font = "normal 12px Inter, system-ui, sans-serif";
    const dateStr = n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "";
    const alarmStr = n.reminderDate ? ` • ⏰ Alarm: ${new Date(n.reminderDate).toLocaleString()}` : "";
    ctx.fillText(`${dateStr}${alarmStr}`, cardX + 20, currentY + 60);

    // Separator line inside card
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(cardX + 20, currentY + 75);
    ctx.lineTo(cardX + cardWidth - 20, currentY + 75);
    ctx.stroke();

    // Content Text
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "normal 15px Inter, system-ui, sans-serif";
    const afterTextY = wrapText(
      ctx,
      n.content || "",
      cardX + 20,
      currentY + 102,
      cardWidth - 40,
      24
    );

    let nextY = afterTextY + 10;

    // Attached Screenshot Image
    if (img && imgDrawHeight > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX + 20, nextY, imgDrawWidth, imgDrawHeight, 12);
      ctx.clip();
      ctx.drawImage(img, cardX + 20, nextY, imgDrawWidth, imgDrawHeight);
      ctx.restore();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.roundRect(cardX + 20, nextY, imgDrawWidth, imgDrawHeight, 12);
      ctx.stroke();

      nextY += imgDrawHeight + 20;
    }

    currentY += cardContentHeight + cardGap;
  });

  // Footer Watermark
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.font = "normal 11px Inter, system-ui, sans-serif";
  ctx.fillText("Generated by SlackNotes (Slack-Hacker)", padding, totalHeight - 15);

  return canvas;
}

/**
 * Export single or multiple notes as JPEG (.jpg) format
 */
export async function exportNotesAsJPEG(notesList, filenamePrefix = "SlackNote") {
  const canvas = await renderNotesToCanvas(notesList);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

  const link = document.createElement("a");
  link.download = `${filenamePrefix}_${Date.now()}.jpg`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export single or multiple notes as PDF (.pdf) format using Canvas & PDF stream generator
 */
export async function exportNotesAsPDF(notesList, filenamePrefix = "SlackNote") {
  const canvas = await renderNotesToCanvas(notesList);
  const imgData = canvas.toDataURL("image/jpeg", 0.90);

  const pdfWindow = window.open("", "_blank");
  if (!pdfWindow) {
    // Fallback if popup blocked: direct image download with pdf recommendation
    const link = document.createElement("a");
    link.download = `${filenamePrefix}_${Date.now()}.jpg`;
    link.href = imgData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const pdfHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filenamePrefix} - Print to PDF</title>
        <style>
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 0;
            padding: 0;
            background: #0f172a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: system-ui, sans-serif;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          .no-print {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 100;
            display: flex;
            gap: 10px;
          }
          .btn {
            background: #10b981;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            font-size: 14px;
          }
          .btn-secondary {
            background: #3b82f6;
          }
          @media print {
            .no-print { display: none; }
            body { background: white; }
            img { box-shadow: none; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
          <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
        </div>
        <img src="${imgData}" onload="setTimeout(function(){ window.print(); }, 500)" />
      </body>
    </html>
  `;

  pdfWindow.document.write(pdfHtml);
  pdfWindow.document.close();
}
