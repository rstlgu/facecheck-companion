// Background service worker per FaceCheck URL Discover

// Crea il menu contestuale all'installazione
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'facecheck-open-url',
    title: 'Apri URL FaceCheck',
    contexts: ['all'],
    documentUrlPatterns: ['https://facecheck.id/*']
  });
  
  chrome.contextMenus.create({
    id: 'facecheck-copy-url',
    title: 'Copia URL FaceCheck',
    contexts: ['all'],
    documentUrlPatterns: ['https://facecheck.id/*']
  });
  
  console.log('[FaceCheck URL Discover] ✅ Menu contestuale creato');
});

// Gestisce il click sul menu contestuale
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'facecheck-open-url' || info.menuItemId === 'facecheck-copy-url') {
    console.log('[FaceCheck URL Discover] 📸 Click menu:', info.menuItemId);
    
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'EXTRACT_URL_FROM_LAST_CLICK'
      });
      
      console.log('[FaceCheck URL Discover] Risposta:', response);
      
      if (response && response.url) {
        if (info.menuItemId === 'facecheck-open-url') {
          console.log('[FaceCheck URL Discover] 🔗 Apro URL:', response.url);
          chrome.tabs.create({ url: response.url });
        } else {
          // Copia negli appunti
          console.log('[FaceCheck URL Discover] 📋 Copio URL:', response.url);
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (url) => {
              navigator.clipboard.writeText(url);
            },
            args: [response.url]
          });
        }
      } else {
        console.log('[FaceCheck URL Discover] ❌ Nessun URL trovato:', response?.error);
      }
    } catch (error) {
      console.error('[FaceCheck URL Discover] ❌ Errore:', error);
    }
  }
});

// Ascolta messaggi dal content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'OPEN_URL') {
    if (request.url) {
      chrome.tabs.create({ url: request.url });
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'URL mancante' });
    }
  }
  return true;
});
