// ==UserScript==
// @name         Webtoon Dark Mode
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Change the background color of the div with id content
// @author       You
// @match        https://www.webtoons.com/*
// @grant        none
// ==/UserScript==

;(function () {
  "use strict"

  window.onload = function () {
    var contentDiv = document.getElementById("content")
    var bottomEpisodeListDiv = document.getElementById("bottomEpisodeList")
    var episodeListSubj = document.querySelectorAll(".episode_lst .subj")

    if (contentDiv) {
      contentDiv.style.backgroundColor = "#161616"
      contentDiv.style.padding = "100px 0 0"
    }

    if (bottomEpisodeListDiv) {
      bottomEpisodeListDiv.style.backgroundColor = "#2f2f2f"
      bottomEpisodeListDiv.style.color = "white"
    }

    if (episodeListSubj) {
      episodeListSubj.forEach(function (element) {
        element.style.color = "white"
      })
    }
  }
})()
