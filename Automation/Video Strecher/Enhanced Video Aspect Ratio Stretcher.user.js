// ==UserScript==
// @name         Enhanced Video Aspect Ratio Stretcher
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Dynamically stretch videos to fill a 16:10 screen with improved aspect ratio detection
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Configuration
    const TARGET_ASPECT_RATIO = 16/10; // Target aspect ratio (16:10)
    const ASPECT_RATIO_THRESHOLD = 0.05; // Threshold for aspect ratio detection
    const STRETCH_MODES = {
        NONE: 0,
        HORIZONTAL: 1,
        VERTICAL: 2,
        CUSTOM: 3
    };

    // State variables
    let currentMode = STRETCH_MODES.NONE;
    let scaleX = 1;
    let scaleY = 1;
    let normalFullscreen = false;

    // Function to determine the best stretching mode for a given video
    function determineStretchMode(video) {
        const videoAspect = video.videoWidth / video.videoHeight;

        // Skip stretching for vertical videos (e.g., 9:16)
        if (videoAspect < 0.75) { // 9:16 = 0.5625, so we use a slightly higher threshold
            return {
                mode: STRETCH_MODES.NONE,
                scaleX: 1,
                scaleY: 1
            };
        }

        // If already close to target ratio, no stretching needed
        if (Math.abs(videoAspect - TARGET_ASPECT_RATIO) < ASPECT_RATIO_THRESHOLD) {
            return {
                mode: STRETCH_MODES.NONE,
                scaleX: 1,
                scaleY: 1
            };
        }

        // Determine which way to stretch
        if (videoAspect > TARGET_ASPECT_RATIO) {
            // Wider than 16:10 (like 16:9, 21:9) - stretch vertically
            const scaleFactor = videoAspect / TARGET_ASPECT_RATIO;
            return {
                mode: STRETCH_MODES.VERTICAL,
                scaleX: 1,
                scaleY: scaleFactor
            };
        } else {
            // Narrower than 16:10 (like 4:3) - stretch horizontally
            const scaleFactor = TARGET_ASPECT_RATIO / videoAspect;
            return {
                mode: STRETCH_MODES.HORIZONTAL,
                scaleX: scaleFactor,
                scaleY: 1
            };
        }
    }

    // Function to apply stretching to video
    function applyStretch(video, stretchX, stretchY) {
        if (!video) return;
        video.style.transform = `scaleX(${stretchX.toFixed(3)}) scaleY(${stretchY.toFixed(3)})`;
        video.style.transformOrigin = 'center center';
    }

    // Toggle video stretching
    function toggleStretchVideo(forceMode = null) {
        const video = document.querySelector('video');
        if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
            return;
        }

        if (forceMode !== null) {
            currentMode = forceMode;
        } else {
            // Cycle through modes
            currentMode = (currentMode + 1) % Object.keys(STRETCH_MODES).length;
        }

        switch (currentMode) {
            case STRETCH_MODES.NONE:
                video.style.transform = '';
                break;

            case STRETCH_MODES.CUSTOM:
                applyStretch(video, scaleX, scaleY);
                break;

            default:
                const stretchInfo = determineStretchMode(video);
                scaleX = stretchInfo.scaleX;
                scaleY = stretchInfo.scaleY;
                applyStretch(video, scaleX, scaleY);
                break;
        }
    }

    // Handle keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        const video = document.querySelector('video');
        if (!video) return;

        // Toggle stretching with 'u' key
        if (e.key === 'u') {
            toggleStretchVideo();
        }

        // Fine-tune stretching with Ctrl+arrows
        if (e.ctrlKey) {
            const step = 0.01;
            let changed = true;

            if (e.key === 'ArrowUp') {
                scaleY += step;
            } else if (e.key === 'ArrowDown') {
                scaleY -= step;
            } else if (e.key === 'ArrowRight') {
                scaleX += step;
            } else if (e.key === 'ArrowLeft') {
                scaleX -= step;
            } else if (e.key === 'r') {
                // Reset scales
                scaleX = 1;
                scaleY = 1;
            } else {
                changed = false;
            }

            if (changed) {
                // Ensure we don't go below minimum scale
                scaleX = Math.max(0.5, scaleX);
                scaleY = Math.max(0.5, scaleY);

                // Switch to custom mode
                currentMode = STRETCH_MODES.CUSTOM;
                applyStretch(video, scaleX, scaleY);
                e.preventDefault();
            }
        }
    });

    // Auto-apply stretching when entering fullscreen
    document.addEventListener('fullscreenchange', function () {
        const video = document.querySelector('video');
        if (!video) return;

        const isYouTube = window.location.hostname.includes('youtube.com');
        const fullscreenElement = document.fullscreenElement ||
                                 document.mozFullScreenElement ||
                                 document.webkitFullscreenElement;

        if (!normalFullscreen) {
            if (fullscreenElement && currentMode === STRETCH_MODES.NONE) {
                // Wait a bit longer for YouTube to ensure video dimensions are available
                const delay = isYouTube ? 500 : 0;

                setTimeout(() => {
                    // Check if video dimensions are available
                    if (video.videoWidth > 0 && video.videoHeight > 0) {
                        toggleStretchVideo(1); // Auto mode
                    }
                }, delay);
            } else if (!fullscreenElement && currentMode !== STRETCH_MODES.NONE) {
                // Reset when exiting fullscreen
                currentMode = STRETCH_MODES.NONE;
                if (video) {
                    video.style.transform = '';
                }
            }
        }
    });

    // Monitor for video element changes/loads
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                const videos = document.querySelectorAll('video');
                videos.forEach(video => {
                    if (!video.hasAttribute('data-stretcher-initialized')) {
                        video.setAttribute('data-stretcher-initialized', 'true');

                        // Handle videos that load after page load
                        video.addEventListener('loadedmetadata', function() {
                            // Auto-apply in fullscreen mode
                            if (document.fullscreenElement &&
                                document.fullscreenElement.contains(video) &&
                                currentMode === STRETCH_MODES.NONE) {
                                toggleStretchVideo(1);
                            }
                        });
                    }
                });
            }
        });
    });

    // Start observing document for video elements
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
