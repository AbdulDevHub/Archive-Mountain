// ==UserScript==
// @name         Hide Scrollbar
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Hide active scrollbar
// @author       You
// @match        http://*/*
// @match        https://*/*
// @match        file:///C:/Users/kokok/*
// @grant        none
// ==/UserScript==

//---------------------- SECTION 1: CURRENT CODE THAT WORKS FOR ALL SITES ---------------------- }
;(function () {
  "use strict"

  function hideScrollBars() {
    if (document.body) {
      var style = document.createElement("style")
      style.id = "hide-scrollbar"
      style.innerHTML = `* {scrollbar-width: none !important; scrollbar-color: unset !important;} ::-webkit-scrollbar {display: none;}`
      document.head.appendChild(style)
    } else {
      setTimeout(hideScrollBars, 100)
    }
  }

  hideScrollBars()
})()

//---------------------- SECTION 2: ORIGINAL CODE THAT HID SCROLLBAR BUT IT DOESN'T WORK FOR PAGES LIKE YOUTUBE, SO REPLACED WITH ABOVE CODE. ---------------------- }
/*(function() {
    'use strict';

    // Add a new style element to the page
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `::-webkit-scrollbar {display: none;} body {overflow: -moz-scrollbars-none; -ms-overflow-style: none;}`;
    document.getElementsByTagName('head')[0].appendChild(style);
})();*/

//---------------------- SECTION 3: UNCOMMENT THIS AND COMMENT SECTION 1 & 2 ABOVE FOR THE SHIFT + SPACEBAR TO HIDE SPACEBAR FUNCTIONALITY ---------------------- }
/* (function() {
    'use strict';

    // Create a style element for hiding the scrollbar
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `body.hide-scrollbar::-webkit-scrollbar {display: none;} body.hide-scrollbar {overflow: -moz-scrollbars-none; -ms-overflow-style: none;}`;
    document.getElementsByTagName('head')[0].appendChild(style);

    // Listen for keydown events = Shift + Spacebar
    window.addEventListener('keydown', function(event) {
        // Check if the space bar and 'h' are pressed together
        if (event.code === 'Space' && event.shiftKey) {
            // Prevent the default action (scrolling)
            event.preventDefault();

            // Toggle the 'hide-scrollbar' class on the body
            document.body.classList.toggle('hide-scrollbar');
        }
    });
})(); */
