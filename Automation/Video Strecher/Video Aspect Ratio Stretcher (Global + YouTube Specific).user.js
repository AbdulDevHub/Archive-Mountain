// ==UserScript==
// @name         Video Aspect Ratio Stretcher (Global + YouTube Specific)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Stretch video to fill a 16:10 screen in fullscreen automatically or when 'u' key is pressed (global, with special handling for YouTube)
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

;(function () {
  "use strict"

  // Variables for stretching mode and scaling factors
  let stretchingMode = 0
  let scaleX = 1
  let scaleY = 1

  // Flag to control normal fullscreen behavior
  let normalFullscreen = false

  // Function to toggle video stretching
  function toggleStretchVideo(forceMode = null) {
    const video = document.querySelector("video")
    if (!video) return

    const aspect = video.videoWidth / video.videoHeight

    if (forceMode !== null) {
      stretchingMode = forceMode
    }

    if (stretchingMode === 0) {
      if (aspect >= 1.77) {
        stretchingMode = 1
        video.style.transform = `scaleY(1.11) scaleX(${scaleX})` // 16:9 to 16:10
      } else {
        stretchingMode = 2
        video.style.transform = `scaleX(1.2) scaleY(${scaleY})` // 4:3 to 16:10
      }
      console.log(`Video stretching enabled. Mode: ${stretchingMode}`)
    } else {
      stretchingMode = 0
      video.style.transform = "" // Reset to original
      console.log("Video stretching disabled.")
    }
  }

  // Keydown event listener for stretching and adjusting scales
  document.addEventListener("keydown", function (e) {
    const video = document.querySelector("video")
    if (!video) return

    if (e.key === "u") {
      const fullscreenElement =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement
      if (fullscreenElement) {
        toggleStretchVideo()
      }
    }

    if (e.ctrlKey) {
      if (e.key === "ArrowUp") {
        scaleY += 0.01
      } else if (e.key === "ArrowDown") {
        scaleY -= 0.01
      } else if (e.key === "ArrowRight") {
        scaleX += 0.01
      } else if (e.key === "ArrowLeft") {
        scaleX -= 0.01
      } else {
        scaleX = 1
        scaleY = 1
      }
      video.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`
    }
  })

  // Fullscreen change event listener
  document.addEventListener("fullscreenchange", function () {
    const video = document.querySelector("video")
    if (!video) return

    const isYouTube = window.location.hostname.includes("youtube.com")
    const fullscreenElement =
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement

    if (!normalFullscreen) {
      if (fullscreenElement && stretchingMode === 0) {
        if (isYouTube) {
          setTimeout(() => toggleStretchVideo(), 250) // YouTube specific delay
        } else {
          toggleStretchVideo() // No delay for other sites
        }
      } else if (!fullscreenElement && stretchingMode !== 0) {
        toggleStretchVideo() // Reset when exiting fullscreen
      }
    }
  })

  // Add styles for stretching modes
  const style = document.createElement("style")
  style.innerHTML = `
        .stretchClass {
            transform-origin: top left;
            transform: scaleX(1) scaleY(1) !important; /* Original size */
        }

        .stretchClass.mode-2 {
            transform-origin: top center;
            transform: scaleX(1.2) scaleY(1) !important; /* 4:3 mode */
        }

        .stretchClass.mode-1 {
            transform-origin: center left;
            transform: scaleX(1) scaleY(1.11) !important; /* 16:9 mode */
        }
    `
  document.head.appendChild(style)
})()
