// ==UserScript==
// @name         Horizontal to Vertical Scroll Remapper
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Redirect horizontal scroll (e.g., MX Master thumb wheel) to vertical scroll
// @author       Abdul Khan
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function findScrollableParent(el) {
        while (el && el !== document.body) {
            const style = getComputedStyle(el);
            const overflowY = style.overflowY;
            if (
                (overflowY === 'auto' || overflowY === 'scroll') &&
                el.scrollHeight > el.clientHeight
            ) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    window.addEventListener("wheel", function (e) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            const target = document.elementFromPoint(e.clientX, e.clientY);

            if (!target) return;

            let scrollable = findScrollableParent(target);

            if (scrollable) {
                e.preventDefault();
                scrollable.scrollTop += e.deltaX;
            } else {
                // Fallback to scrolling the page
                e.preventDefault();
                window.scrollBy({
                    top: e.deltaX,
                    left: 0,
                    behavior: "auto"
                });
            }
        }
    }, { passive: false });
})();
