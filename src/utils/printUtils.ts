/**
 * Utility functions for reliable printing in iframe and browser environments.
 */

export const printElement = (
  elementId: string,
  docTitle: string = 'Document'
): { success: boolean; message: string } => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      window.print();
      return { success: true, message: "Impression lancée via le navigateur." };
    }

    // Try hidden iframe print first (often bypasses sandbox print blocking)
    const existingIframe = document.getElementById('app-print-iframe');
    if (existingIframe && existingIframe.parentNode) {
      existingIframe.parentNode.removeChild(existingIframe);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'app-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    // Extract all stylesheets and style tags
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n');

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="utf-8" />
            <title>${docTitle}</title>
            ${styles}
            <style>
              @page {
                size: A4 portrait;
                margin: 10mm 10mm 10mm 10mm;
              }
              html, body {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              }
              body {
                padding: 10mm !important;
                color: #0f172a !important;
              }
              .no-print {
                display: none !important;
              }
            </style>
          </head>
          <body>
            <div style="width: 100%; max-width: 210mm; margin: 0 auto; background: white;">
              ${element.innerHTML}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (iframeErr) {
          console.warn('Iframe print error, falling back to window.print():', iframeErr);
          window.print();
        }
      }, 350);

      // Clean up after 2 minutes
      setTimeout(() => {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 120000);

      return {
        success: true,
        message: "Fenêtre d'impression demandée.",
      };
    } else {
      window.print();
      return { success: true, message: "Impression lancée via le navigateur." };
    }
  } catch (err) {
    console.warn('Print element fallback:', err);
    try {
      window.print();
      return { success: true, message: "Impression lancée via le navigateur." };
    } catch {
      return {
        success: false,
        message: "Impression bloquée par le navigateur dans cette fenêtre.",
      };
    }
  }
};

/**
 * Downloads a standalone, self-contained HTML printable file.
 * The user can open it in any browser and print it in 1 click without iframe restrictions.
 */
export const downloadPrintableHtml = (
  elementId: string,
  filename: string,
  docTitle: string = 'Document'
): boolean => {
  try {
    const element = document.getElementById(elementId);
    if (!element) return false;

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle}</title>
  ${styles}
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    html, body {
      background: #f1f5f9;
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .print-bar {
      max-width: 210mm;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .print-btn {
      background: #059669;
      color: white;
      border: none;
      padding: 8px 18px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .print-btn:hover {
      background: #047857;
    }
    .a4-paper {
      width: 100%;
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 16mm 18mm;
      box-sizing: border-box;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border-radius: 2px;
    }
    @media print {
      body {
        background: white !important;
        padding: 0 !important;
      }
      .print-bar {
        display: none !important;
      }
      .a4-paper {
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <div>
      <strong style="font-size: 15px;">Aperçu Format A4 prêt pour impression</strong>
      <div style="font-size: 12px; opacity: 0.8;">${docTitle} · 210 × 297 mm</div>
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ Lancer l'impression (Ctrl + P)</button>
  </div>
  <div class="a4-paper">
    ${element.innerHTML}
  </div>
  <script>
    // Trigger print dialog on load
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

    return true;
  } catch (err) {
    console.error('Download printable HTML error:', err);
    return false;
  }
};
