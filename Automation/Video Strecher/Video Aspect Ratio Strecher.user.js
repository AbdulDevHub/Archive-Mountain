// ==UserScript==
// @name         Video Aspect Ratio Stretcher
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Stretch video to fill a 16:10 screen in fullscreen when 'u' key is pressed
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

// THIS DOESN'T WORK ON YOUTUBE PROPERLY

;(function () {
  "use strict"

  // Define the initial stretching mode and scale factors
  let stretchingMode = 0 // 0: Original, 1: Stretch Video
  let scaleX = 1
  let scaleY = 1

  // Set this to true to deactivate automatic stretch when click fullscreen
  let normalFullscreen = false

  // Function to toggle the video stretching
  function toggleStretchVideo() {
    const video = document.querySelector("video")

    // Calculate the scale factor based on the video's aspect ratio
    const aspect = video.videoWidth / video.videoHeight
    let scale

    // Check the current stretching mode
    if (stretchingMode === 0) {
      // Check the aspect ratio of the video
      if (aspect >= 1.77) {
        // 16:9 video
        stretchingMode = 1
        scale = aspect / 1.77
        scale = Math.round(scale * 100) / 100
      } else {
        // 4:3 video
        stretchingMode = 2
        scale = 1.33 // Adjust the scale factor as needed
      }

      // Add the stretching class to the video element
      video.classList.add("stretchClass", `mode-${stretchingMode}`)
      console.log(
        `Video stretching enabled with scale factor: ${scale}. Mode: ${stretchingMode}`
      )
    } else {
      // Reset the stretching mode and remove the stretching class from the video element
      stretchingMode = 0
      video.classList.remove("stretchClass", "mode-1", "mode-2")
      console.log(`Video stretching disabled. Mode: ${stretchingMode}`)
    }
  }

  // Add event listener for the 'u' key and arrow keys
  document.addEventListener("keydown", function (e) {
    if (e.key === "u") {
      // Check if the user is in fullscreen
      const fullscreenElement =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement
      const video = document.querySelector("video")
      if (fullscreenElement) {
        scaleX = 1
        scaleY = 1
        video.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`
        toggleStretchVideo()
      } else {
        const aspect = video.videoWidth / video.videoHeight
        if (scaleX != 1) {
          scaleX = 1
          scaleY = 1
          video.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`
        } else {
          // Only works if video is 4:3 code: else if (aspect < 1.77) {
          scaleX = 1.36
          scaleY = 1
          video.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`
        }
      }
    }

    // Check if the control key was pressed
    if (e.ctrlKey) {
      const video = document.querySelector("video")
      if (e.key === "ArrowUp") {
        scaleY += 0.01
      } else if (e.key === "ArrowDown") {
        scaleY -= 0.01
      } else if (e.key === "ArrowRight") {
        scaleX += 0.01
      } else if (e.key === "ArrowLeft") {
        scaleX -= 0.01
      } else {
        // Reset the scale factors if only ctrl pressed
        scaleX = 1
        scaleY = 1
      }
      video.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`
    }
  })

  // Add event listener for fullscreen change
  document.addEventListener("fullscreenchange", function () {
    // Check if the user is in fullscreen
    const fullscreenElement =
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement
    // If the normal fullscreen mode is not activated
    if (!normalFullscreen) {
      // If the user is in fullscreen and the stretching mode is off, enable the video stretching
      if (fullscreenElement && stretchingMode === 0) {
        toggleStretchVideo()
      } else if (!fullscreenElement && stretchingMode !== 0) {
        toggleStretchVideo()
      }
    }
  })

  // Add styles to stretch the video
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
