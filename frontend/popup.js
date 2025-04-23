let selectedContent = '';

// Listen for selected text/page content sent from background/content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SEND_SELECTED_CONTENT') {
        selectedContent = message.content || '';
        document.getElementById('selectedContentDisplay').textContent = selectedContent || '[No content selected]';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Request selected content from background on popup open
    chrome.runtime.sendMessage({ type: 'REQUEST_SELECTED_CONTENT' });
    // Set default display
    document.getElementById('selectedContentDisplay').textContent = '[Waiting for selected content...]';
});

document.getElementById('previewBtn').addEventListener('click', async function () {
    const { jsPDF } = window.jspdf;
   
    
    const text = selectedContent || '';
    if (!text) {
        alert('No text or content selected!');
        return;
    }
    const font = document.getElementById('fontSelect').value;
    const fontSize = parseInt(document.getElementById('fontSizeInput').value, 10);
    const fontColor = document.getElementById('fontColorInput').value;
    const pageSize = document.getElementById('pageSizeSelect').value;
    const orientation = document.getElementById('orientationSelect').value;

     // Create PDF
     const doc = new jsPDF({
        orientation: orientation,
        unit: 'pt',
        format: pageSize
    });

    doc.setFont(font, 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(fontColor);

    // Split text to fit page width
    const pageWidth = doc.internal.pageSize.getWidth() - 40;
    const lines = doc.splitTextToSize(text, pageWidth);

    doc.text(lines, 20, 40);

    // Add page number footer
    doc.setFontSize(10);
    doc.text(`Page 1`, pageWidth - 40, doc.internal.pageSize.getHeight() - 20, { align: 'right' });

    // Show PDF preview
    const pdfPreview = document.getElementById('pdfPreview');
    pdfPreview.innerHTML = '';
    const pdfUrl = doc.output('bloburl');
    const iframe = document.createElement('iframe');
    iframe.src = pdfUrl;
    iframe.width = '100%';
    iframe.height = '300px';
    iframe.className = 'rounded border shadow';
    pdfPreview.appendChild(iframe);

    // Add Download PDF button
    let downloadBtn = document.getElementById('downloadPdfBtn');
    if (!downloadBtn) {
        downloadBtn = document.createElement('button');
        downloadBtn.id = 'downloadPdfBtn';
        downloadBtn.textContent = 'Download PDF';
        downloadBtn.className = 'mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200';
        pdfPreview.appendChild(downloadBtn);
    }
    // Store doc for download
    window._currentPdfDoc = doc;

    downloadBtn.onclick = function() {
        let filename = prompt('Enter filename for PDF (without extension .pdf):', document.title || 'converted');
        if (!filename) filename = 'converted';
        window._currentPdfDoc.save(filename + '.pdf');
    };

});
