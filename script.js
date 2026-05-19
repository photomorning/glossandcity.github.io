const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const searchToggles = document.querySelectorAll("[data-search-toggle]");
const searchPanel = document.querySelector("[data-search-panel]");
const searchForm = document.querySelector("[data-search-form]");
const storyGrid = document.querySelector("[data-story-grid]");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

searchToggles.forEach((button) => {
  button.addEventListener("click", () => {
    searchPanel?.classList.toggle("is-open");
    searchPanel?.querySelector("input")?.focus();
  });
});

if (searchForm && storyGrid) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = new FormData(searchForm).get("q").toString().trim().toLowerCase();
    const cards = storyGrid.querySelectorAll(".story-card");

    cards.forEach((card) => {
      const haystack = `${card.dataset.title || ""} ${card.dataset.category || ""}`;
      card.classList.toggle("is-hidden", Boolean(query) && !haystack.includes(query));
    });
  });
}
