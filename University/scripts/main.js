let currentSlide = 0;
let totalSlides = 0;
let contentData = null;

// Load JSON file
async function loadContent() {
  try {
    const response = await fetch("../content.json");
    contentData = await response.json();
    initializeSlides();
  } catch (error) {
    console.error("Error loading content.json:", error);
    document.getElementById("slides-container").innerHTML =
      '<div class="loading">Error loading content. Please ensure content.json is in the same directory.</div>';
  }
}

function initializeSlides() {
  const container = document.getElementById("slides-container");
  container.innerHTML = ""; // Clear loading message

  // Create intro slide
  const introSlide = document.createElement("div");
  introSlide.className = "slide artifact-slide active";

  introSlide.innerHTML = `
    <div class="artifact-left">
        <div class="artifact-media">
            <img src="${contentData.introImage}" alt="Console Wars Introduction">
        </div>
    </div>
    <div class="artifact-right">
        <div class="artifact-number">Introduction</div>
        <h2>${contentData.title}</h2>
        ${contentData.intro
          .split("\n\n")
          .map((p) => `<p>${p}</p>`)
          .join("")}
    </div>
  `;
  container.appendChild(introSlide);

  // Create artifact slides
  contentData.artifacts.forEach((artifact, index) => {
    const artifactSlide = document.createElement("div");
    artifactSlide.className = "slide artifact-slide";

    const fileExtension = artifact.link.split(".").pop().toLowerCase();
    const isVideo =
      fileExtension === "mp4" ||
      fileExtension === "webm" ||
      fileExtension === "mov";

    const mediaHtml = isVideo
      ? `<video controls preload="metadata"><source src="${artifact.link}" type="video/${fileExtension}">Your browser does not support the video tag.</video>`
      : `<img src="${artifact.link}" alt="${artifact.title}">`;

    artifactSlide.innerHTML = `
      <div class="artifact-left">
          <div class="artifact-media">
              ${mediaHtml}
          </div>
      </div>
      <div class="artifact-right">
          <div class="artifact-number">Artifact ${index + 1} of ${
      contentData.artifacts.length
    }</div>
          <h2>${artifact.title}</h2>
          <p>${artifact.description}</p>
          <div class="citations">
              <h3>Sources</h3>
              <ul>
                  ${artifact.citations
                    .map((cite) => `<li>${cite}</li>`)
                    .join("")}
              </ul>
          </div>
      </div>
    `;
    container.appendChild(artifactSlide);
  });

  totalSlides = contentData.artifacts.length + 1;
  updatePagination();
  updateNavigation();

  // Initialize Plyr after slides have been added
  setTimeout(() => {
    const players = Array.from(document.querySelectorAll("video")).map(
      (p) =>
        new Plyr(p, {
          controls: [
            "play-large",
            "play",
            "progress",
            "current-time",
            "mute",
            "volume",
            "fullscreen",
          ],
          theme: "dark",
        })
    );
  }, 0);

  // Re-initialize Lucide icons after slides are created
  lucide.createIcons();
}

function changeSlide(direction) {
  const slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;

  // Pause any playing videos before switching slides
  document.querySelectorAll("video").forEach((v) => {
    v.pause();
    v.currentTime = 0;
  });

  slides[currentSlide].classList.remove("active");

  currentSlide += direction;

  if (currentSlide >= totalSlides) currentSlide = 0;
  if (currentSlide < 0) currentSlide = totalSlides - 1;

  slides[currentSlide].classList.add("active");
  updateNavigation();
  updatePagination();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToSlide(index) {
  const slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;

  slides[currentSlide].classList.remove("active");
  currentSlide = index;
  slides[currentSlide].classList.add("active");
  updateNavigation();
  updatePagination();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateNavigation() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const firstBtn = document.getElementById("firstBtn");
  const lastBtn = document.getElementById("lastBtn");

  prevBtn.disabled = currentSlide === 0;
  firstBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === totalSlides - 1;
  lastBtn.disabled = currentSlide === totalSlides - 1;

  // Add wave effect classes to all buttons
  [prevBtn, nextBtn, firstBtn, lastBtn].forEach(btn => {
    btn.classList.add('waves-effect', 'waves-light');
  });
}

function updatePagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 0; i < totalSlides; i++) {
    const num = document.createElement("div");
    num.className =
      "pagination-number waves-effect waves-light" + (i === currentSlide ? " active" : "");
    num.textContent = i + 1;
    num.addEventListener("click", () => goToSlide(i));
    pagination.appendChild(num);
  }
}

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && currentSlide > 0) {
    changeSlide(-1);
  } else if (e.key === "ArrowRight" && currentSlide < totalSlides - 1) {
    changeSlide(1);
  }
});

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Load content on page load
  loadContent();
  lucide.createIcons();

  // Image Enlargement Feature
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target.tagName === "IMG" && target.closest(".artifact-media")) {
      const lightbox = document.getElementById("imageLightbox");
      const lightboxImg = document.getElementById("lightboxImage");
      lightboxImg.src = target.src;
      lightbox.classList.add("active");
    }
  });

  const closeLightbox = document.getElementById("closeLightbox");
  if (closeLightbox) {
    closeLightbox.addEventListener("click", () => {
      document.getElementById("imageLightbox").classList.remove("active");
    });
  }

  // Allow closing by clicking the dark area
  const imageLightbox = document.getElementById("imageLightbox");
  if (imageLightbox) {
    imageLightbox.addEventListener("click", (e) => {
      if (e.target.id === "imageLightbox") {
        e.currentTarget.classList.remove("active");
      }
    });
  }
});

// Allow closing lightbox by pressing Escape (can be outside DOMContentLoaded)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const lightbox = document.getElementById("imageLightbox");
    if (lightbox) {
      lightbox.classList.remove("active");
    }
  }
});