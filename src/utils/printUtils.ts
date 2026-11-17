/**
 * Utility functions for reliable printing in iframe and browser environments.
 * Automatically filters out empty/blank pages so only pages containing data are printed.
 */

/**
 * Checks whether an HTML element actually contains meaningful printable data
 * (ignoring .no-print controls, script/style tags, and whitespace-only nodes).
 */
export const hasPrintableData = (element: Element | null): boolean => {
  if (!element) return false;

  const clone = element.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll('.no-print, script, style, [data-print-empty="true"]')
    .forEach((node) => node.remove());

  const text = (clone.textContent || '').replace(/[\s\u00A0]+/g, '');
  if (text.length > 0) return true;

  // Check for images or non-empty form inputs/textareas
  if (clone.querySelector('img[src], canvas')) return true;

  const inputs = Array.from(clone.querySelectorAll('input, textarea, select'));
  return inputs.some((el) => {
    const val = (el as HTMLInputElement).value;
    return typeof val === 'string' && val.trim().length > 0;
  });
};

/**
 * Marks empty `.print-page` or `.print-exclude-empty` sections with `data-print-empty="true"`
 * right before printing so the browser excludes empty pages completely.
 */
export const prepareDocumentForPrint = (root: ParentNode = document): void => {
  const candidates = root.querySelectorAll('.print-page, [data-print-page], .print-exclude-empty');
  candidates.forEach((node) => {
    if (!hasPrintableData(node)) {
      node.setAttribute('data-print-empty', 'true');
    } else {
      node.removeAttribute('data-print-empty');
    }
  });
};

/**
 * Restores any temporary print attributes after printing completes.
 */
export const cleanupDocumentAfterPrint = (root: ParentNode = document): void => {
  root.querySelectorAll('[data-print-empty="true"]').forEach((node) => {
    node.removeAttribute('data-print-empty');
  });
};

/**
 * Builds a clean printable clone containing only non-empty data sections and no `.no-print` elements.
 */
const buildCleanPrintableHtml = (element: HTMLElement): string | null => {
  if (!hasPrintableData(element)) return null;

  const clone = element.cloneNode(true) as HTMLElement;

  // Remove interactive/non-printable elements
  clone.querySelectorAll('.no-print, .print-guide-margin').forEach((node) => node.remove());

  // Remove any empty sub-pages or empty excluded sections
  clone
    .querySelectorAll('.print-page, [data-print-page], .print-exclude-empty')
    .forEach((node) => {
      if (!hasPrintableData(node)) {
        node.remove();
      }
    });

  // Remove trailing empty spacer nodes so they cannot push an extra blank page
  while (clone.lastElementChild && !hasPrintableData(clone.lastElementChild)) {
    clone.lastElementChild.remove();
  }

  return hasPrintableData(clone) ? clone.innerHTML : null;
};

export const printElement = (
  elementId: string,
  docTitle: string = 'Document'
): { success: boolean; message: string; requiresFallback?: boolean } => {
  try {
    const element = document.getElementById(elementId);

    if (element && !hasPrintableData(element)) {
      return {
        success: false,
        message: 'Aucune donnée à imprimer : les pages vides sont automatiquement exclues.',
      };
    }

    prepareDocumentForPrint(document);

    const handleAfterPrint = () => {
      cleanupDocumentAfterPrint(document);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);

    // Direct window print is best when print media styles are properly configured
    try {
      window.print();
      // Fallback cleanup in case afterprint doesn't fire in sandboxed iframes
      setTimeout(() => cleanupDocumentAfterPrint(document), 1500);
      return {
        success: true,
        message:
          "Boîte d'impression demandée (raccourci clavier : Ctrl + P). Seules les pages contenant des données seront imprimées. Si le navigateur bloque la fenêtre, utilisez « Télécharger Feuille ».",
      };
    } catch (printErr) {
      cleanupDocumentAfterPrint(document);
      window.removeEventListener('afterprint', handleAfterPrint);
      console.warn('Direct window.print blocked or failed:', printErr);
      downloadPrintableHtml(elementId, `${docTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_A4`, docTitle);
      return {
        success: true,
        requiresFallback: true,
        message: "L'impression a été redirigée vers la feuille autonome téléchargée prête à imprimer.",
      };
    }
  } catch (err) {
    cleanupDocumentAfterPrint(document);
    console.warn('Print element fallback error:', err);
    return {
      success: false,
      requiresFallback: true,
      message: "Utilisez « Télécharger Feuille » pour ouvrir et imprimer directement ce document.",
    };
  }
};

/**
 * Downloads a standalone, self-contained HTML printable file.
 * Automatically strips empty pages and non-printable UI so only data-bearing pages print.
 */
export const downloadPrintableHtml = (
  elementId: string,
  filename: string,
  docTitle: string = 'Document'
): boolean => {
  try {
    const element = document.getElementById(elementId);
    if (!element) return false;

    const cleanInnerHtml = buildCleanPrintableHtml(element);
    if (!cleanInnerHtml) return false;

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
      margin: 8mm;
    }
    html, body {
      background: #f1f5f9;
      margin: 0;
      padding: 20px;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-feature-settings: "zero" 0 !important;
    }
    *, *::before, *::after {
      font-feature-settings: "zero" 0 !important;
    }
    .font-mono {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-variant-numeric: tabular-nums !important;
      font-feature-settings: "zero" 0 !important;
    }
    .tabular-nums {
      font-variant-numeric: tabular-nums !important;
      font-feature-settings: "zero" 0 !important;
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
      margin: 0 auto;
      background: white;
      padding: 14mm 16mm;
      box-sizing: border-box;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border-radius: 2px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    @media print {
      html, body {
        background: white !important;
        margin: 0 !important;
        padding: 0 !important;
        height: auto !important;
        min-height: 0 !important;
      }
      .print-bar, .no-print, [data-print-empty="true"], .print-page:empty {
        display: none !important;
      }
      .a4-paper {
        display: block !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        max-width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <div>
      <strong style="font-size: 15px;">Aperçu Format A4 prêt pour impression</strong>
      <div style="font-size: 12px; opacity: 0.8;">${docTitle} · 210 × 297 mm · Pages vides exclues</div>
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ Lancer l'impression (Ctrl + P)</button>
  </div>
  <div class="a4-paper">
    ${cleanInnerHtml}
  </div>
  <script>
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
