import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewerWithHighlights = ({ fileUrl, references }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Referenced PDF Pages</h2>
      <Document file={fileUrl}>
        {references.map((ref, index) => (
          <div key={index} className="mb-6 border p-4 rounded bg-gray-100">
            <h4 className="font-bold">Page {ref.page + 1}</h4>
            <Page pageNumber={ref.page + 1} />
            <p className="mt-2 text-sm text-gray-700">
              <strong>Excerpt:</strong> {ref.text.slice(0, 300)}...
            </p>
          </div>
        ))}
      </Document>
    </div>
  );
};

export default PDFViewerWithHighlights;
