// Script iniettato nel main world per intercettare le risposte API di FaceCheck

(function() {
  'use strict';
  
  if (window.__fcInjected) return;
  window.__fcInjected = true;
  
  console.log('[FaceCheck URL Discover] 🚀 Main world script loaded');
  
  // Cache globale
  window.__fcUrlCache = new Map();
  
  // Decodifica base64 e estrae URL
  function extractUrlFromBase64(base64Data) {
    try {
      let cleanBase64 = base64Data;
      if (base64Data.includes(',')) {
        cleanBase64 = base64Data.split(',')[1];
      }
      cleanBase64 = cleanBase64.replace(/\s/g, '');
      
      const binaryString = atob(cleanBase64);
      const searchLength = Math.min(2000, binaryString.length);
      const endPortion = binaryString.slice(-searchLength);
      
      // Cerca pattern JSON {"url":"..."}
      const jsonPattern = /\{"url":"([^"]+)"\}/;
      const match = endPortion.match(jsonPattern);
      
      if (match && match[1]) {
        return match[1];
      }
      
      // Prova URL pattern diretto
      const urlPattern = /https?:\/\/[a-zA-Z0-9\-._~:\/?#\[\]@!$&'()*+,;=%]+/g;
      const urls = endPortion.match(urlPattern);
      if (urls && urls.length > 0) {
        return urls[urls.length - 1];
      }
      
      return null;
    } catch (e) {
      console.error('[FaceCheck URL Discover] Errore decodifica:', e);
      return null;
    }
  }
  
  // Processa risposta API
  function processSearchResponse(data) {
    if (!data || !data.output || !data.output.items) return;
    
    const items = data.output.items;
    console.log('[FaceCheck URL Discover] 📦 Processando', items.length, 'risultati');
    
    const results = [];
    
    for (const item of items) {
      if (item.guid && item.base64) {
        const url = extractUrlFromBase64(item.base64);
        if (url) {
          window.__fcUrlCache.set(item.guid, url);
          results.push({ guid: item.guid, url: url });
          console.log('[FaceCheck URL Discover] 🔗', item.guid.substring(0, 8) + '...', '→', url);
        }
      }
    }
    
    console.log('[FaceCheck URL Discover] ✅ Estratti', results.length, 'URL. Cache:', window.__fcUrlCache.size);
    
    // Notifica il content script
    window.postMessage({
      type: 'FC_URLS_EXTRACTED',
      data: results,
      cacheSize: window.__fcUrlCache.size
    }, '*');
  }
  
  // Intercetta fetch
  const originalFetch = window.fetch;
  window.fetch = async function(url, options) {
    const response = await originalFetch.apply(this, arguments);
    
    const urlString = (typeof url === 'string' ? url : url?.url) || '';
    
    if (urlString.includes('/api/search')) {
      console.log('[FaceCheck URL Discover] 🌐 Intercettata API:', urlString);
      try {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        processSearchResponse(data);
      } catch (e) {
        console.error('[FaceCheck URL Discover] Errore parsing fetch:', e);
      }
    }
    
    return response;
  };
  
  // Intercetta XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url) {
    this._fcUrl = url;
    return originalXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function() {
    const xhr = this;
    xhr.addEventListener('load', function() {
      const urlString = xhr._fcUrl?.toString() || '';
      
      if (urlString.includes('/api/search')) {
        console.log('[FaceCheck URL Discover] 🌐 Intercettata XHR:', urlString);
        try {
          const data = JSON.parse(xhr.responseText);
          processSearchResponse(data);
        } catch (e) {
          console.error('[FaceCheck URL Discover] Errore parsing XHR:', e);
        }
      }
    });
    
    return originalXHRSend.apply(this, arguments);
  };
  
  // Gestisce richieste dal content script
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'FC_GET_URL') {
      const guid = event.data.guid;
      const url = window.__fcUrlCache.get(guid);
      
      window.postMessage({
        type: 'FC_URL_RESPONSE',
        guid: guid,
        url: url || null
      }, '*');
    }
  });
  
  console.log('[FaceCheck URL Discover] 🔧 API interception ready');
})();

