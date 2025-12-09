// Content script per FaceCheck URL Discover

(function() {
  'use strict';
  
  console.log('[FaceCheck URL Discover] ✅ Content script caricato');
  
  // Cache locale degli URL
  const urlCache = new Map();
  
  // Ultimo elemento cliccato con tasto destro
  let lastRightClickedElement = null;
  
  // Traccia il right-click
  document.addEventListener('contextmenu', (e) => {
    lastRightClickedElement = e.target;
  }, true);
  
  // Inietta script nel main world
  function injectScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.type = 'text/javascript';
    
    script.onload = function() {
      console.log('[FaceCheck URL Discover] ✅ Script iniettato nel main world');
      this.remove();
    };
    
    script.onerror = function(e) {
      console.error('[FaceCheck URL Discover] ❌ Errore iniezione script:', e);
    };
    
    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(script);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        (document.head || document.documentElement).appendChild(script);
      });
    }
  }
  
  // Inietta subito
  injectScript();
  
  // Ascolta messaggi dal main world (injected.js)
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    
    // Riceve gli URL estratti
    if (event.data && event.data.type === 'FC_URLS_EXTRACTED') {
      const results = event.data.data;
      console.log('[FaceCheck URL Discover] 📨 Ricevuti', results.length, 'URL dal main world');
      
      for (const item of results) {
        urlCache.set(item.guid, item.url);
      }
      
      console.log('[FaceCheck URL Discover] 📊 Cache locale:', urlCache.size, 'entries');
    }
    
    // Risposta a richiesta URL
    if (event.data && event.data.type === 'FC_URL_RESPONSE') {
      // Gestito inline dove serve
    }
  });
  
  // Trova il guid dall'elemento cliccato
  function findGuidFromElement(element) {
    if (!element) return null;
    
    const link = element.closest('a[data-guid]');
    if (link) return link.getAttribute('data-guid');
    
    const facediv = element.closest('.facediv');
    if (facediv) {
      const parentLink = facediv.closest('a[data-guid]');
      if (parentLink) return parentLink.getAttribute('data-guid');
    }
    
    return null;
  }
  
  // Gestisce i messaggi dal background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'EXTRACT_URL_FROM_LAST_CLICK') {
      if (!lastRightClickedElement) {
        sendResponse({ error: 'Nessun elemento cliccato' });
        return true;
      }
      
      const guid = findGuidFromElement(lastRightClickedElement);
      console.log('[FaceCheck URL Discover] GUID:', guid);
      console.log('[FaceCheck URL Discover] Cache size:', urlCache.size);
      
      if (!guid) {
        sendResponse({ error: 'GUID non trovato' });
        return true;
      }
      
      const url = urlCache.get(guid);
      console.log('[FaceCheck URL Discover] URL:', url);
      
      if (url) {
        sendResponse({ url: url });
      } else {
        // Debug
        console.log('[FaceCheck URL Discover] GUIDs in cache:', Array.from(urlCache.keys()).slice(0, 5));
        sendResponse({ error: 'URL non in cache. Riprova dopo una nuova ricerca.' });
      }
    }
    
    return true;
  });
  
  console.log('[FaceCheck URL Discover] ✅ Inizializzazione completata');
  
})();
