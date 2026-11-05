const products = [
  {
    title: "Deniz kenarında",
    alt: "Mavi ortancalar, deniz ve deniz kabuklarıyla resmedilmiş ayraç",
    images: [
      "17de4547-IMG_0961_01.jpg",
      "17de4547-IMG_0961_02.jpg",
      "17de4547-IMG_0961_03.jpg",
      "17de4547-IMG_0961_04.jpg",
    ],
  },
  {
    title: "Oyun molası",
    alt: "Oyun kumandası tutan neşeli bir karakterin illüstrasyonuyla ayraç",
    images: [
      "ae39a960-IMG_0955_01.jpg",
      "ae39a960-IMG_0955_02.jpg",
      "ae39a960-IMG_0955_03.jpg",
      "ae39a960-IMG_0955_04.jpg",
    ],
  },
  {
    title: "Kış masalı",
    alt: "Atkılı ve kışlık kıyafetli geyik illüstrasyonuyla ayraç",
    images: [
      "b9d48a92-IMG_0957_01.jpg",
      "b9d48a92-IMG_0957_02.jpg",
      "b9d48a92-IMG_0957_03.jpg",
      "b9d48a92-IMG_0957_04.jpg",
    ],
  },
  {
    title: "Pembe çiçek",
    alt: "Gökkuşağı yansımalı çerçevede pembe çiçek illüstrasyonlu ayraç",
    images: ["be89bb01-IMG_0951_01.jpg"],
  },
];

const dialog = document.querySelector(".lightbox");
const image = document.querySelector(".lightbox-image");
const title = document.querySelector(".lightbox-title");
const count = document.querySelector(".lightbox-count");
const closeButton = document.querySelector(".lightbox-close");
const catalogGrid = document.querySelector("#catalog-grid");
const catalogCount = document.querySelector("#catalog-count");
const catalogEmpty = document.querySelector("#catalog-empty");
const catalogError = document.querySelector("#catalog-error");
const catalogSearch = document.querySelector("#catalog-search");
const bookmarkCarousel = document.querySelector(".bookmark-carousel");
const carouselScene = document.querySelector(".carousel-scene");
const carouselSlide = document.querySelector(".carousel-slide:not(.carousel-incoming)");
const carouselIncoming = document.querySelector(".carousel-incoming");
const carouselImage = carouselSlide.querySelector(".carousel-image");
const carouselIncomingImage = carouselIncoming.querySelector(".carousel-image");
const carouselPosition = document.querySelector(".carousel-position");
const carouselTrackFill = document.querySelector(".carousel-track-fill");
const carouselCurrentCode = document.querySelector(".carousel-current-code");
const carouselPrev = document.querySelector(".carousel-prev");
const carouselNext = document.querySelector(".carousel-next");
let activePhotos = [];
let activeImage = 0;
let opener = null;
let catalogPhotos = [];
let carouselIndex = 0;
let carouselBusy = false;
let suppressCarouselClick = false;

function showImage() {
  const photo = activePhotos[activeImage];
  image.src = photo.src;
  image.alt = photo.alt;
  title.textContent = photo.title;
  count.textContent = `${String(activeImage + 1).padStart(2, "0")} / ${String(activePhotos.length).padStart(2, "0")}`;
  const multiple = activePhotos.length > 1;
  document.querySelector(".lightbox-prev").hidden = !multiple;
  document.querySelector(".lightbox-next").hidden = !multiple;
}

function openPhotos(photos, source, startIndex = 0) {
  activePhotos = photos;
  activeImage = startIndex;
  opener = source;
  showImage();
  dialog.showModal();
  closeButton.focus();
}

function photoForCatalog(filename) {
  const photoTitle = filename.replace(/\.jpg$/i, "");
  return {
    src: `assets/bookmarks/catalog/${filename}`,
    title: photoTitle,
    alt: `${photoTitle} kodlu kitap ayracı`,
  };
}

function photosForCatalog() {
  return catalogPhotos.map(photoForCatalog);
}

function photosForProduct(product) {
  return product.images.map((filename, index) => ({
    src: `assets/bookmarks/${filename}`,
    title: product.title,
    alt: `${product.alt}, fotoğraf ${index + 1}`,
  }));
}

function renderCatalog() {
  const query = catalogSearch.value.trim().toLocaleLowerCase("tr");
  const visiblePhotos = catalogPhotos.filter((filename) => filename.toLocaleLowerCase("tr").includes(query));
  catalogGrid.replaceChildren();

  const cards = visiblePhotos.map((filename) => {
    const titleText = filename.replace(/\.jpg$/i, "");
    const button = document.createElement("button");
    button.className = "catalog-card";
    button.type = "button";
    button.dataset.catalogPhoto = filename;
    button.setAttribute("aria-label", `${titleText} kodlu ayraç fotoğrafını aç`);

    const photo = document.createElement("img");
    photo.src = `assets/bookmarks/catalog/${filename}`;
    photo.alt = `${titleText} kodlu kitap ayracı`;
    photo.loading = "lazy";
    photo.decoding = "async";

    const caption = document.createElement("span");
    caption.className = "catalog-code";
    caption.textContent = titleText;
    button.append(photo, caption);
    return button;
  });

  catalogGrid.append(...cards);
  catalogCount.textContent = query
    ? `${visiblePhotos.length} / ${catalogPhotos.length} ayraç`
    : `${catalogPhotos.length} ayraç`;
  catalogEmpty.hidden = visiblePhotos.length > 0;
}

function updateCarousel(direction) {
  if (carouselBusy || catalogPhotos.length === 0) return;
  carouselBusy = true;
  const nextIndex = (carouselIndex + direction + catalogPhotos.length) % catalogPhotos.length;
  const filename = catalogPhotos[nextIndex];
  carouselIncomingImage.src = `assets/bookmarks/catalog/${filename}`;
  carouselIncomingImage.alt = `${filename.replace(/\.jpg$/i, "")} kodlu kitap ayracı`;
  carouselIncoming.inert = true;
  carouselIncoming.setAttribute("aria-hidden", "true");
  carouselScene.classList.add(direction > 0 ? "is-turning-next" : "is-turning-prev");

  const finishTurn = () => {
    carouselIndex = nextIndex;
    carouselImage.src = carouselIncomingImage.src;
    carouselImage.alt = carouselIncomingImage.alt;
    carouselSlide.setAttribute("aria-label", `${filename.replace(/\.jpg$/i, "")} kodlu ayraç fotoğrafını büyüt`);
    carouselPosition.innerHTML = `${String(carouselIndex + 1).padStart(2, "0")} <i>/ ${catalogPhotos.length}</i>`;
    carouselCurrentCode.textContent = filename.replace(/\.jpg$/i, "");
    carouselTrackFill.style.transform = `scaleX(${(carouselIndex + 1) / catalogPhotos.length})`;
    carouselScene.classList.remove("is-turning-next", "is-turning-prev");
    carouselIncoming.inert = true;
    carouselIncoming.setAttribute("aria-hidden", "true");
    carouselBusy = false;
  };

  window.setTimeout(finishTurn, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 660);
}

async function loadCatalog() {
  try {
    const response = await fetch("assets/bookmarks/catalog/photos.json");
    if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
    const filenames = await response.json();
    if (!Array.isArray(filenames) || filenames.length !== 78 || filenames.some((name) => typeof name !== "string" || !/^BM-[A-Z]{2}-[\w-]+\.jpg$/i.test(name))) {
      throw new Error("The bookmark photo manifest is invalid.");
    }
    catalogPhotos = filenames;
    renderCatalog();
    carouselIndex = catalogPhotos.indexOf("BM-AB-015-C.jpg");
    if (carouselIndex < 0) carouselIndex = 0;
    const filename = catalogPhotos[carouselIndex];
    carouselImage.src = `assets/bookmarks/catalog/${filename}`;
    carouselImage.alt = `${filename.replace(/\.jpg$/i, "")} kodlu kitap ayracı`;
    carouselSlide.setAttribute("aria-label", `${filename.replace(/\.jpg$/i, "")} kodlu ayraç fotoğrafını büyüt`);
    carouselPosition.innerHTML = `${String(carouselIndex + 1).padStart(2, "0")} <i>/ ${catalogPhotos.length}</i>`;
    carouselCurrentCode.textContent = filename.replace(/\.jpg$/i, "");
    carouselTrackFill.style.transform = `scaleX(${(carouselIndex + 1) / catalogPhotos.length})`;
  } catch (error) {
    catalogCount.textContent = "Ayraç fotoğrafları yüklenemedi";
    catalogError.hidden = false;
    console.error("Could not load bookmark catalog.", error);
  }
}

document.querySelectorAll(".design-image").forEach((button) => {
  button.addEventListener("click", () => {
    const product = products[Number(button.dataset.product)];
    openPhotos(photosForProduct(product), button);
  });
});

carouselSlide.addEventListener("click", () => {
  if (carouselBusy) return;
  if (suppressCarouselClick) {
    suppressCarouselClick = false;
    return;
  }
  const filename = catalogPhotos[carouselIndex];
  if (!filename) return;
  openPhotos(photosForCatalog(), carouselSlide, carouselIndex);
});
carouselPrev.addEventListener("click", () => updateCarousel(-1));
carouselNext.addEventListener("click", () => updateCarousel(1));
bookmarkCarousel.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  updateCarousel(event.key === "ArrowRight" ? 1 : -1);
});
let dragStartX = null;
carouselScene.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  dragStartX = event.clientX;
});
carouselScene.addEventListener("pointerup", (event) => {
  if (dragStartX === null) return;
  const distance = event.clientX - dragStartX;
  dragStartX = null;
  if (Math.abs(distance) < 45) return;
  suppressCarouselClick = true;
  updateCarousel(distance < 0 ? 1 : -1);
  window.setTimeout(() => { suppressCarouselClick = false; }, 0);
});
carouselScene.addEventListener("pointercancel", () => {
  dragStartX = null;
});
carouselScene.addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaX) < 30) return;
  updateCarousel(event.deltaX > 0 ? 1 : -1);
}, { passive: true });

catalogGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-catalog-photo]");
  if (!button) return;
  const filename = button.dataset.catalogPhoto;
  const photoIndex = catalogPhotos.indexOf(filename);
  if (photoIndex < 0) return;
  openPhotos(photosForCatalog(), button, photoIndex);
});

catalogSearch.addEventListener("input", renderCatalog);
catalogSearch.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  catalogSearch.value = "";
  renderCatalog();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !dialog.open && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    catalogSearch.focus();
  }
});

document.querySelector(".lightbox-prev").addEventListener("click", () => {
  activeImage = (activeImage - 1 + activePhotos.length) % activePhotos.length;
  showImage();
});
document.querySelector(".lightbox-next").addEventListener("click", () => {
  activeImage = (activeImage + 1) % activePhotos.length;
  showImage();
});

closeButton.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => opener?.focus());
dialog.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  activeImage = (activeImage + (event.key === "ArrowRight" ? 1 : -1) + activePhotos.length) % activePhotos.length;
  showImage();
});

loadCatalog();
