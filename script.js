// ======================================================
// LIGHTBOX: zoomable & draggable image
// ======================================================

const awttw1 = document.getElementById("awttw1");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const imgContainer = document.querySelector(".lightbox-image-container");

const zoomLevels = [1, 4, 8];
let currentZoomIndex = 0;

let targetPanX = 0,
  targetPanY = 0;
let currentPanX = 0,
  currentPanY = 0;

let isDragging = false;
let dragStartX = 0,
  dragStartY = 0;
let moved = false;

let containerWidth = 0,
  containerHeight = 0;
let imgWidth = 0,
  imgHeight = 0;

const lerpFactor = 0.2;
let instantZoom = false;

// ----------------- OPEN LIGHTBOX -----------------
awttw1.addEventListener("click", () => {
  lightbox.style.display = "flex";
  document.body.classList.add("noscroll");

  currentZoomIndex = 0;
  targetPanX = targetPanY = currentPanX = currentPanY = 0;

  lightboxImg.src = awttw1.dataset.full;
  lightboxImg.onload = () => {
    fitImageInContainer();
    animate();
  };
});

// ----------------- CLOSE LIGHTBOX -----------------
function closeLightbox() {
  lightbox.style.display = "none";
  document.body.classList.remove("noscroll");
}

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

// ----------------- DRAG & ZOOM HANDLERS -----------------
imgContainer.addEventListener("mousedown", (e) => {
  if (zoomLevels[currentZoomIndex] === 1) return;
  isDragging = true;
  moved = false;
  dragStartX = e.clientX - targetPanX;
  dragStartY = e.clientY - targetPanY;
  imgContainer.classList.add("grabbing");
});

imgContainer.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  if (
    !moved &&
    Math.abs(e.clientX - dragStartX - targetPanX) +
      Math.abs(e.clientY - dragStartY - targetPanY) >
      3
  ) {
    moved = true;
  }

  targetPanX = e.clientX - dragStartX;
  targetPanY = e.clientY - dragStartY;
  constrainPan();
});

imgContainer.addEventListener("mouseup", (e) => {
  isDragging = false;
  imgContainer.classList.remove("grabbing");
  if (!moved) zoomAtCursor(e);
});

imgContainer.addEventListener("mouseleave", () => {
  isDragging = false;
  imgContainer.classList.remove("grabbing");
});

// ----------------- ZOOM FUNCTION -----------------
function zoomAtCursor(e) {
  const rect = imgContainer.getBoundingClientRect();
  const cursorX = e.clientX - rect.left;
  const cursorY = e.clientY - rect.top;

  const oldScale = zoomLevels[currentZoomIndex];
  currentZoomIndex = (currentZoomIndex + 1) % zoomLevels.length;
  const newScale = zoomLevels[currentZoomIndex];

  if (newScale === 1) {
    targetPanX = currentPanX = 0;
    targetPanY = currentPanY = 0;
    lightboxImg.style.transform = `translate(0px, 0px) scale(1)`;
    return;
  }

  const offsetX = (cursorX - containerWidth / 2 - currentPanX) / oldScale;
  const offsetY = (cursorY - containerHeight / 2 - currentPanY) / oldScale;

  targetPanX = currentPanX - offsetX * (newScale - oldScale);
  targetPanY = currentPanY - offsetY * (newScale - oldScale);

  constrainPan();
  instantZoom = true;
}

// ----------------- ANIMATE -----------------
function animate() {
  if (instantZoom) {
    currentPanX = targetPanX;
    currentPanY = targetPanY;
    instantZoom = false;
  } else if (isDragging) {
    currentPanX = targetPanX;
    currentPanY = targetPanY;
  } else {
    currentPanX += (targetPanX - currentPanX) * lerpFactor;
    currentPanY += (targetPanY - currentPanY) * lerpFactor;
  }

  const scale = zoomLevels[currentZoomIndex];
  lightboxImg.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${scale})`;

  // cursor updates
  // inside animate()
  if (currentZoomIndex < 2) {
    // first 2 zoom levels
    imgContainer.classList.remove("zoomed");
  } else {
    // 3rd zoom level
    imgContainer.classList.add("zoomed");
  }

  // grabbing cursor is handled by mousedown/mouseup events already

  if (lightbox.style.display === "flex") requestAnimationFrame(animate);
}

// ----------------- CONSTRAIN PAN -----------------
function constrainPan() {
  const scale = zoomLevels[currentZoomIndex];
  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;

  const maxPanX = Math.max(0, (scaledWidth - containerWidth) / 2);
  const maxPanY = Math.max(0, (scaledHeight - containerHeight) / 2);

  targetPanX = Math.min(maxPanX, Math.max(-maxPanX, targetPanX));
  targetPanY = Math.min(maxPanY, Math.max(-maxPanY, targetPanY));
}

// ----------------- FIT IMAGE -----------------
function fitImageInContainer() {
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.9;

  const imgRatio = lightboxImg.naturalWidth / lightboxImg.naturalHeight;

  let containerW = maxWidth;
  let containerH = containerW / imgRatio;

  if (containerH > maxHeight) {
    containerH = maxHeight;
    containerW = containerH * imgRatio;
  }

  imgContainer.style.width = containerW + "px";
  imgContainer.style.height = containerH + "px";

  containerWidth = containerW;
  containerHeight = containerH;

  imgWidth = containerW;
  imgHeight = containerH;

  targetPanX = targetPanY = currentPanX = currentPanY = 0;
}

window.addEventListener("resize", () => {
  if (lightbox.style.display === "flex") {
    fitImageInContainer();
    constrainPan();
  }
});

// ======================================================
// SNAIL ANIMATION (constant speed + pause/resume, no reset)
// ======================================================

const snail = document.getElementById("snail");
let snailMoving = false;
let snailPaused = false;
const snailSpeed = 10;

snail.addEventListener("click", (e) => {
  e.preventDefault();

  const rect = snail.getBoundingClientRect();
  const distance = rect.left + rect.width;

  if (!snailMoving) {
    snail.style.setProperty("--snail-distance", `-${distance}px`);
    snail.style.animationDuration = `${distance / snailSpeed}s`;
    snail.classList.remove("paused", "moving");
    void snail.offsetWidth;
    snail.classList.add("moving");

    snailMoving = true;
    snailPaused = false;
    return;
  }

  if (snailMoving && !snailPaused) {
    snail.classList.add("paused");
    snailPaused = true;
    return;
  }

  if (snailMoving && snailPaused) {
    snail.classList.remove("paused");
    snailPaused = false;
  }
});

// ----------------- TOUCH SUPPORT -----------------
imgContainer.addEventListener("touchstart", (e) => {
  if (zoomLevels[currentZoomIndex] === 1) return;
  isDragging = true;
  moved = false;
  const touch = e.touches[0];
  dragStartX = touch.clientX - targetPanX;
  dragStartY = touch.clientY - targetPanY;
  imgContainer.classList.add("grabbing");
});

imgContainer.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];
  if (
    !moved &&
    Math.abs(touch.clientX - dragStartX - targetPanX) +
      Math.abs(touch.clientY - dragStartY - targetPanY) >
      3
  ) {
    moved = true;
  }
  targetPanX = touch.clientX - dragStartX;
  targetPanY = touch.clientY - dragStartY;
  constrainPan();
});

imgContainer.addEventListener("touchend", (e) => {
  isDragging = false;
  imgContainer.classList.remove("grabbing");
  if (!moved) zoomAtCursor(e.changedTouches[0]);
});
