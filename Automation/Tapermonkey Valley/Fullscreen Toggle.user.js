// ==UserScript==
// @name         Fullscreen Toggle
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Press Shift + Alt + F to toggle fullscreen mode on any website
// @author       Your Name
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.altKey && e.key === 'F') {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
    });
})();
