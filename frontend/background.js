chrome.runtime.onInstalled.addListener(() => {
  //right click menu item creation
  chrome.contextMenus.create({
    id: "convertToPDF",
    title: "Convert page text to PDF",
    contexts: ["page", "selection"]// show menu item when clicked on page 
    // or clicked after text selection
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => { //info-->context related
  if (info.menuItemId === "convertToPDF") {
    const selectedText = info.selectionText;
    
    if (selectedText) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: function (selectedText) {
            // This will run in the page context where prompt() works
            const filename = prompt("Enter filename for PDF (without extension):", document.title);
            if (filename) {
              fetch('http://localhost:5000/api/generate-pdf', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                  text: selectedText,
                  filename: filename
                })
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Failed to generate PDF');
                }
                return response.arrayBuffer();
              })
              .then(arrayBuffer => {
                const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${filename}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              })
              .catch(error => {
                console.error('Error:', error);
                alert('Failed to generate PDF. Please try again.');
              });
            }
          },
          args: [selectedText]
        });
      });
    } else {
      // If no text is selected, use the entire page text
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: function () {
            const allText = document.body.innerText;
            const filename = prompt("Enter filename for PDF (without extension):", document.title);
            if (filename) {
              fetch('http://localhost:5000/api/generate-pdf', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                  text: allText,
                  filename: filename
                })
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Failed to generate PDF');
                }
                return response.arrayBuffer();
              })
              .then(arrayBuffer => {
                const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${filename}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              })
              .catch(error => {
                console.error('Error:', error);
                alert('Failed to generate PDF. Please try again.');
              });
            }
          },
          args: []
        });
      });
    }
  }
});

function getPageText() {
  return document.body.innerText;
}
