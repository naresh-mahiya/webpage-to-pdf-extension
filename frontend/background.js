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
    console.log("Getting convertToPDF");
    const selectedText = info.selectionText;
    console.log("Selected text:", selectedText);
    if (selectedText) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: function (selectedText) {
            fetch('http://localhost:5000/api/generate-pdf', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ text: selectedText })
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Failed to generate PDF');
                }
                return response.arrayBuffer();//binary buffer of pdf
              })
              .then(arrayBuffer => {
                const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);//blob-->binary large object
                const a = document.createElement('a');
                a.href = url;//blob ko refrence ke liye
                a.download = 'output.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);//clean the url from browser storage
              })
              .catch(error => console.error('Error:', error));
          },
          args: [selectedText] //args for the fucntion in scripting
        });
      });
    }
    else {
      console.log("Hit in all")
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: function () {
            const allText = document.body.innerText;
            fetch('http://localhost:5000/api/generate-pdf', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ text: allText })
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
                a.download = 'output.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              })
              .catch(error => console.error('Error:', error));
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
