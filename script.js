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
const fan = document.querySelector(".bookmark-fan");
const fanToggle = document.querySelector(".fan-toggle");
let activePhotos = [];
let activeImage = 0;
let opener = null;
let catalogPhotos = [];

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

function openPhotos(photos, source) {
  activePhotos = photos;
  activeImage = 0;
  opener = source;
  showImage();
  dialog.showModal();
  closeButton.focus();
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

document.querySelectorAll(".fan-card").forEach((button) => {
  button.addEventListener("click", () => {
    const filename = button.dataset.feature;
    const alt = button.querySelector("img").alt;
    openPhotos([{
      src: `assets/bookmarks/catalog/${filename}`,
      title: filename.replace(/\.jpg$/i, ""),
      alt,
    }], button);
  });
});

catalogGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-catalog-photo]");
  if (!button) return;
  const filename = button.dataset.catalogPhoto;
  openPhotos([{
    src: `assets/bookmarks/catalog/${filename}`,
    title: filename.replace(/\.jpg$/i, ""),
    alt: `${filename.replace(/\.jpg$/i, "")} kodlu kitap ayracı`,
  }], button);
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

function setFanExpanded(expanded) {
  fan.classList.toggle("is-open", expanded);
  fanToggle.setAttribute("aria-expanded", String(expanded));
  fanToggle.querySelector("span").textContent = expanded ? "Kapat" : "↗";
}

fan.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") setFanExpanded(true);
});
fan.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") setFanExpanded(fan.contains(document.activeElement));
});
fan.addEventListener("focusin", (event) => {
  if (event.target !== fanToggle) setFanExpanded(true);
});
fan.addEventListener("focusout", () => {
  requestAnimationFrame(() => {
    if (!fan.contains(document.activeElement) && !fan.matches(":hover")) setFanExpanded(false);
  });
});
fanToggle.addEventListener("click", () => {
  const expanded = !fan.classList.contains("is-open");
  setFanExpanded(expanded);
  if (!expanded) fanToggle.blur();
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
