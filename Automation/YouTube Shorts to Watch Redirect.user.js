// ==UserScript==
// @name         YouTube Shorts to Watch Redirect
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Redirect YouTube Shorts to regular watch URL, including when navigating within site (SPA support)
// @author       OpenAI
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function redirectIfShorts() {
        const currentUrl = location.href;
        const shortsMatch = currentUrl.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
        if (shortsMatch) {
            const videoId = shortsMatch[1];
            const newUrl = `https://www.youtube.com/watch?v=${videoId}`;
            if (location.href !== newUrl) {
                history.replaceState(null, '', newUrl); // update URL in history
                location.reload(); // reload to load video in correct player
            }
        }
    }

    // Initial check
    redirectIfShorts();

    // Observe URL changes (for SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            redirectIfShorts();
        }
    }).observe(document, { subtree: true, childList: true });
})();
