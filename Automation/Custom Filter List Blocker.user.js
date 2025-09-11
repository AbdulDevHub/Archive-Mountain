// ==UserScript==
// @name         Custom Filter List Blocker
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Block elements and requests based on custom filter list with debugging
// @author       You
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Enable debug logging
    const DEBUG = false;
    function log(...args) {
        if (DEBUG) console.log('[FilterBlocker]', ...args);
    }

    // Your custom filter list - paste your filters here
    const filterList = `
youtube.com##.ytp-pause-overlay
youtube.com##ytd-popup-container
www.youtube.com##tp-yt-paper-dialog.ytd-popup-container.style-scope
www.youtube.com##.opened
www.youtube.com###mealbar-promo-renderer > .yt-mealbar-promo-renderer.style-scope
www.youtube.com##ytd-item-section-renderer.ytd-section-list-renderer.style-scope:nth-of-type(2)

www.reddit.com##pdp-right-rail
reddit.com##pdp-right-rail

animekai.to###comment
animekai.to##.justify-content-start

aniwatch.to##.block_area_category.block_area
aniwatch.to##.block_area-comment.block_area

aniwave.se###comments
aniwave.se##.brating

asura.gg##.code-block-1.code-block
asura.gg##div.bixbox:nth-of-type(1)
asura.gg##.comments-area.bixbox

||www.redditstatic.com/shreddit/en-US/xpromo-nsfw-blocking-modal-desktop-*.js
    `.trim();

    const currentDomain = window.location.hostname;
    log('Current domain:', currentDomain);

    // Parse filter list
    const elementHidingRules = [];
    const networkBlockingRules = [];
    let rulesApplied = 0;

    function parseFilters() {
        log('Parsing filters...');
        let parsed = 0;

        filterList.split('\n').forEach((line, index) => {
            line = line.trim();
            if (!line || line.startsWith('!')) return;

            try {
                // Element hiding rules (##)
                if (line.includes('##')) {
                    const parts = line.split('##');
                    if (parts.length === 2) {
                        const domain = parts[0].trim();
                        const selector = parts[1].trim();

                        if (domainMatches(domain)) {
                            elementHidingRules.push({
                                domain: domain,
                                selector: selector,
                                originalLine: line
                            });
                            parsed++;
                            log(`Added element rule for ${domain}: ${selector}`);
                        }
                    }
                }
                // Network blocking rules (||)
                else if (line.startsWith('||')) {
                    const parts = line.split('$');
                    const url = parts[0].replace('||', '');
                    const options = parts[1] || '';

                    networkBlockingRules.push({
                        url: url,
                        options: options,
                        originalLine: line
                    });
                    parsed++;
                    log(`Added network rule: ${url}`);
                }
            } catch (e) {
                log('Error parsing line:', line, e);
            }
        });

        log(`Parsed ${parsed} total rules, ${elementHidingRules.length} element hiding rules for this domain`);
    }

    function domainMatches(filterDomain) {
        if (!filterDomain) return false;

        // Remove protocol if present
        filterDomain = filterDomain.replace(/^https?:\/\//, '');

        // Exact match
        if (filterDomain === currentDomain) {
            return true;
        }

        // Check if current domain ends with filter domain (subdomain match)
        if (currentDomain.endsWith('.' + filterDomain)) {
            return true;
        }

        // Check if filter domain ends with current domain (parent domain match)
        if (filterDomain.endsWith('.' + currentDomain)) {
            return true;
        }

        return false;
    }

    // Create blocking CSS
    function createBlockingCSS() {
        const css = `
            .filter-blocked-element {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                max-height: 0 !important;
                max-width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
                overflow: hidden !important;
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
        log('Added blocking CSS');
    }

    // Hide elements with better error handling
    function hideElements() {
        let hidden = 0;

        elementHidingRules.forEach((rule, index) => {
            try {
                const elements = document.querySelectorAll(rule.selector);
                if (elements.length > 0) {
                    elements.forEach(el => {
                        if (!el.classList.contains('filter-blocked-element')) {
                            el.classList.add('filter-blocked-element');
                            el.setAttribute('data-blocked-by', rule.domain);
                            hidden++;
                        }
                    });
                    if (elements.length > 0) {
                        log(`Hidden ${elements.length} elements with selector: ${rule.selector}`);
                    }
                }
            } catch (e) {
                log(`Invalid selector (${rule.domain}): ${rule.selector}`, e.message);
                // Remove invalid selectors to prevent repeated errors
                elementHidingRules.splice(index, 1);
            }
        });

        if (hidden > 0) {
            rulesApplied += hidden;
            log(`Hidden ${hidden} elements this round, ${rulesApplied} total`);
        }

        return hidden;
    }

    // Block network requests
    function setupNetworkBlocking() {
        if (networkBlockingRules.length === 0) return;

        log('Setting up network blocking...');

        // Block images
        const originalImage = window.Image;
        window.Image = function() {
            const img = new originalImage();
            const originalSetAttribute = img.setAttribute;

            img.setAttribute = function(name, value) {
                if (name === 'src' || name === 'data-src') {
                    const shouldBlock = networkBlockingRules.some(rule => {
                        return value && value.includes(rule.url) &&
                               (rule.options.includes('image') || !rule.options);
                    });

                    if (shouldBlock) {
                        log('Blocked image:', value);
                        return originalSetAttribute.call(this, name, 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
                    }
                }
                return originalSetAttribute.call(this, name, value);
            };

            return img;
        };

        // Block existing images
        function blockExistingImages() {
            document.querySelectorAll('img').forEach(img => {
                const src = img.src || img.getAttribute('data-src');
                if (src) {
                    const shouldBlock = networkBlockingRules.some(rule => {
                        return src.includes(rule.url) &&
                               (rule.options.includes('image') || !rule.options);
                    });

                    if (shouldBlock) {
                        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                        img.classList.add('filter-blocked-element');
                        log('Blocked existing image:', src);
                    }
                }
            });
        }

        // Monitor for new elements
        const observer = new MutationObserver(mutations => {
            let newElementsFound = false;

            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    newElementsFound = true;

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Block new images
                            if (node.tagName === 'IMG') {
                                const src = node.src || node.getAttribute('data-src');
                                if (src) {
                                    const shouldBlock = networkBlockingRules.some(rule => {
                                        return src.includes(rule.url);
                                    });

                                    if (shouldBlock) {
                                        node.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                        node.classList.add('filter-blocked-element');
                                        log('Blocked new image:', src);
                                    }
                                }
                            }

                            // Check for images in added subtree
                            if (node.querySelectorAll) {
                                node.querySelectorAll('img').forEach(img => {
                                    const src = img.src || img.getAttribute('data-src');
                                    if (src) {
                                        const shouldBlock = networkBlockingRules.some(rule => {
                                            return src.includes(rule.url);
                                        });

                                        if (shouldBlock) {
                                            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                            img.classList.add('filter-blocked-element');
                                            log('Blocked subtree image:', src);
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });

            if (newElementsFound) {
                // Hide new elements
                hideElements();
            }
        });

        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            blockExistingImages();
        } else {
            // If body doesn't exist yet, wait for it
            const bodyObserver = new MutationObserver(() => {
                if (document.body) {
                    bodyObserver.disconnect();
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                    blockExistingImages();
                }
            });
            bodyObserver.observe(document.documentElement, {
                childList: true
            });
        }
    }

    // Main initialization
    function init() {
        log('Initializing Custom Filter Blocker...');
        log('Document ready state:', document.readyState);

        parseFilters();

        if (elementHidingRules.length === 0 && networkBlockingRules.length === 0) {
            log('No applicable rules found for this domain');
            return;
        }

        createBlockingCSS();

        // Initial hiding
        const initialHidden = hideElements();
        log(`Initial hiding complete, hidden ${initialHidden} elements`);

        // Set up network blocking
        setupNetworkBlocking();

        // Continuous monitoring for element hiding
        const hideInterval = setInterval(() => {
            const hidden = hideElements();
            if (hidden === 0) {
                // If no new elements are being hidden, reduce frequency
                clearInterval(hideInterval);
                setInterval(hideElements, 5000); // Check every 5 seconds instead
                log('Switched to low-frequency monitoring');
            }
        }, 1000);

        // Status logging
        setTimeout(() => {
            log(`Status after 5 seconds: ${rulesApplied} elements blocked total`);
        }, 5000);

        log('Initialization complete');
    }

    // Multi-stage initialization to catch different loading states

    // Immediate initialization for early blocking
    parseFilters();
    if (elementHidingRules.length > 0) {
        createBlockingCSS();
        // Try immediate hiding
        if (document.documentElement) {
            hideElements();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready
        init();
    }

    // Fallback initialization
    setTimeout(init, 100);
    setTimeout(init, 500);
    setTimeout(init, 1000);

    // Early and frequent hiding for fast-loading pages
    const earlyHideInterval = setInterval(() => {
        if (document.body && elementHidingRules.length > 0) {
            hideElements();
        }
    }, 100);

    // Stop early frequent hiding after page is likely loaded
    setTimeout(() => {
        clearInterval(earlyHideInterval);
        log('Stopped early frequent hiding');
    }, 10000);

})();
