// ==UserScript==
// @name        Disable Bing Search Engine Scroll
// @author      reddit.com/u/pinpann
// @namespace   reddit.com/comments/11dautm/comment/ja7ngte
// @description Disables scrolling on the Bing search engine page to prevent accidental scrolling into the Bing chat feature.
// @match       https://www.bing.com/*
// @version     1.0
// @grant       none
// @homepageURL https://reddit.com/11f1yb6
// ==/UserScript==

window.addEventListener("wheel", (e) => {
  if (e.target.className.includes("cib-serp-main")) e.stopPropagation()
})
