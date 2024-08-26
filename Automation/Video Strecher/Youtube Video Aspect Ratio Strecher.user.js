// ==UserScript==
// @name         YouTube Video Aspect Ratio Stretcher
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Stretch video to fill a 16:10 screen in fullscreen automatically or when 'u' key is pressed (YouTube specific)
// @author       You
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let stretchingMode = 0;
    let scaleX = 1;
    let scaleY = 1;

    function toggleStretchVideo(forceMode = null) {
        const video = document.querySelector('video');
        if (!video) return;

        const aspect = video.videoWidth / video.videoHeight;

        if (forceMode !== null) {
            stretchingMode = forceMode;
        }

        if (stretchingMode === 0) {
            if (aspect >= 1.77) {
                stretchingMode = 1;
                video.style.transform = scaleY(1.11) scaleX(${scaleX}); // 16:9 to 16:10
            } else {
                stretchingMode = 2;
                video.style.transform = scaleX(1.2) scaleY(${scaleY}); // 4:3 to 16:10
            }
            console.log(Video stretching enabled. Mode: ${stretchingMode});
        } else {
            stretchingMode = 0;
            video.style.transform = ''; // Reset to original
            console.log('Video stretching disabled.');
        }
    }

    document.addEventListener('keydown', function (e) {
        const video = document.querySelector('video');
        if (!video) return;

        if (e.key === 'u') {
            const fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            if (fullscreenElement) {
                toggleStretchVideo();
            }
        }

        if (e.ctrlKey) {
            if (e.key === 'ArrowUp') {
                scaleY += 0.01;
            } else if (e.key === 'ArrowDown') {
                scaleY -= 0.01;
            } else if (e.key === 'ArrowRight') {
                scaleX += 0.01;
            } else if (e.key === 'ArrowLeft') {
                scaleX -= 0.01;
            } else {
                scaleX = 1;
                scaleY = 1;
            }
            video.style.transform = scaleX(${scaleX}) scaleY(${scaleY});
        }
    });

    document.addEventListener('fullscreenchange', function () {
        const video = document.querySelector('video');
        if (!video) return;

        if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
            setTimeout(() => {
                if (stretchingMode === 0) {
                    toggleStretchVideo(); // Automatically stretch when entering fullscreen
                }
            }, 250); // Delay to allow YouTube's adjustments to complete
        } else if (stretchingMode !== 0) {
            toggleStretchVideo(); // Reset when exiting fullscreen
        }
    });

})();
