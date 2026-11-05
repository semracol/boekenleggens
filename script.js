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
let activeProduct = 0;
let activeImage = 0;
let opener = null;

function showImage() {
  const product = products[activeProduct];
  image.src = `assets/bookmarks/${product.images[activeImage]}`;
  image.alt = product.alt;
  title.textContent = product.title;
  count.textContent = `${String(activeImage + 1).padStart(2, "0")} / ${String(product.images.length).padStart(2, "0")}`;
  const multiple = product.images.length > 1;
  document.querySelector(".lightbox-prev").hidden = !multiple;
  document.querySelector(".lightbox-next").hidden = !multiple;
}

document.querySelectorAll(".design-image").forEach((button) => {
  button.addEventListener("click", () => {
    activeProduct = Number(button.dataset.product);
    activeImage = 0;
    opener = button;
    showImage();
    dialog.showModal();
    closeButton.focus();
  });
});

document.querySelector(".lightbox-prev").addEventListener("click", () => {
  const total = products[activeProduct].images.length;
  activeImage = (activeImage - 1 + total) % total;
  showImage();
});

document.querySelector(".lightbox-next").addEventListener("click", () => {
  const total = products[activeProduct].images.length;
  activeImage = (activeImage + 1) % total;
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
  const total = products[activeProduct].images.length;
  activeImage = (activeImage + (event.key === "ArrowRight" ? 1 : -1) + total) % total;
  showImage();
});
