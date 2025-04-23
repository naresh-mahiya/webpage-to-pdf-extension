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
    // Store selected text or page content for popup
    const selectedText = info.selectionText;
    chrome.storage.local.set({ lastSelectedContent: selectedText || '' });
    // Open the extension popup programmatically
    chrome.action.openPopup();
  }
});

function getPageText() {
  return document.body.innerText;
}

// Listen for popup requests for selected content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REQUEST_SELECTED_CONTENT') {
    chrome.storage.local.get('lastSelectedContent', (data) => {
      const content = data.lastSelectedContent || '';
      chrome.runtime.sendMessage({ type: 'SEND_SELECTED_CONTENT', content });
    });
  }
});
