import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Pastikan file pdf.worker.min.js ada di folder /public proyek React Anda
// Anda bisa mendapatkannya dari 'pdfjs-dist/build/pdf.worker.min.js'
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

/**
 * Komponen PdfPreview (Versi Final)
 * * Menampilkan file PDF dalam sebuah modal. Versi ini telah disempurnakan untuk:
 * 1. Menerima 'snippets', yaitu array objek yang berisi teks relevan dan halaman asalnya.
 * 2. Menampilkan layout dua kolom: satu untuk konteks relevan dan satu untuk preview PDF.
 * 3. Secara dinamis menampilkan potongan teks (snippets) yang sesuai dengan halaman PDF yang sedang dilihat.
 * 4. Memberikan navigasi yang memungkinkan pengguna berpindah antar halaman relevan lainnya.
 */
const PdfPreview = ({ fileData, relevantPages, initialPage, onClose, fileName, snippets }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Setiap kali komponen menerima halaman awal yang baru, set indeksnya
  useEffect(() => {
    const initialIndex = relevantPages.indexOf(initialPage);
    if (initialIndex !== -1) {
      setCurrentPageIndex(initialIndex);
    }
  }, [initialPage, relevantPages]);

  const goToPrevRelevantPage = () => {
    setCurrentPageIndex(prevIndex => Math.max(prevIndex - 1, 0));
  };

  const goToNextRelevantPage = () => {
    setCurrentPageIndex(prevIndex => Math.min(prevIndex + 1, relevantPages.length - 1));
  };

  // Nomor halaman aktual yang akan ditampilkan berdasarkan indeks saat ini
  const currentVisiblePage = relevantPages[currentPageIndex];

  // Filter snippets untuk hanya menampilkan yang ada di halaman saat ini
  const snippetsForCurrentPage = (snippets || [])
    .filter(snippet => snippet.pages.includes(currentVisiblePage))
    .map(snippet => snippet.text);

  return (
    // Latar belakang modal
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
      {/* Kontainer Modal Utama */}
      <div className="bg-white rounded-lg shadow-2xl w-11/12 h-5/6 flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800 truncate pr-4" title={fileName}>{fileName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
        </div>

        {/* Konten Utama (Layout Terbagi) */}
        <div className="flex-1 overflow-hidden p-4 bg-gray-200 flex flex-col md:flex-row gap-4">
          
          {/* Kolom Kiri: Konteks Relevan */}
          <div className="md:w-1/3 h-full overflow-y-auto bg-gray-50 p-3 rounded-lg border flex flex-col">
            <h4 className="font-bold text-md mb-2 border-b pb-2 text-gray-900 flex-shrink-0">
              Konteks Relevan dari Halaman {currentVisiblePage}
            </h4>
            <div className="space-y-3 text-sm text-gray-700 overflow-y-auto flex-grow">
              {snippetsForCurrentPage.length > 0 ? (
                snippetsForCurrentPage.map((snippet, index) => (
                  <blockquote key={index} className="p-3 border-l-4 border-green-600 bg-green-50 rounded-r-md whitespace-pre-wrap font-serif">
                    "{snippet}"
                  </blockquote>
                ))
              ) : (
                <p className="text-gray-500 italic p-3">Tidak ada kutipan teks spesifik yang terkait dengan halaman ini.</p>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Preview PDF */}
          <div className="md:w-2/3 h-full overflow-y-auto flex justify-center">
            <Document
              file={fileData}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<div className="text-center p-4">Memuat dokumen...</div>}
              error={<div className="text-center text-red-500 p-4">Gagal memuat PDF.</div>}
            >
              <Page pageNumber={currentVisiblePage} scale={1.5} renderTextLayer={true} />
            </Document>
          </div>
        </div>
        
        {/* Footer Modal (Navigasi) */}
        <div className="flex justify-between items-center p-2 text-center text-sm text-gray-600 border-t">
          <button 
            onClick={goToPrevRelevantPage} 
            disabled={currentPageIndex === 0} 
            className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹ Hal. Relevan Sebelumnya
          </button>
          <span>Halaman {currentVisiblePage} dari {numPages || '...'}</span>
          <button 
            onClick={goToNextRelevantPage} 
            disabled={currentPageIndex >= relevantPages.length - 1} 
            className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hal. Relevan Berikutnya ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfPreview;