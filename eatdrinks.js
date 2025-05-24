document.addEventListener("DOMContentLoaded", () => {
  const sectionCenter   = document.querySelector(".section-center");
  const filterContainer = document.querySelector(".filter-btn-container");
  const searchInput     = document.getElementById("search-input");
  const priceRange      = document.getElementById("price-range");
  const priceValue      = document.getElementById("price-value");

  let menuData = []; // will hold our fetched menu items

  // load the menu data once on page load
  fetch("menu.json")
    .then(res => res.json())
    .then(data => {
      menuData = data;
      setupFilterButtons(menuData); // create category buttons
      applyFilters();               // initial render
    })
    .catch(err => console.error("Failed to load menu:", err));

  // build buttons for each unique category (+ "all" at start)
  function setupFilterButtons(data) {
    const cats = data.reduce((acc, { category }) => {
      if (!acc.includes(category)) acc.push(category);
      return acc;
    }, ["all"]);

    filterContainer.innerHTML = cats
      .map(c => `<button class="btn" data-id="${c}">${c}</button>`)
      .join("");

    // mark "all" as active by default
    const allBtn = filterContainer.querySelector('[data-id="all"]');
    if (allBtn) allBtn.classList.add("active");
  }

  // switch the banner image based on the selected category
  function updateCategoryImage(category) {
    const img = document.getElementById("category-img");
    // always show the “all” banner
    if (category === "all") {
      img.src = "./assets/all.png";
      img.alt = "All Categories";
      img.style.display = "block";
      return;
    }
    // make a slug: lowercase, replace spaces/slashes with hyphens
    const slug = category
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\//g, "-")
      // if I have accents like “ğ”, normalize and strip diacritics:
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    img.src = `./assets/${slug}.png`;
    img.alt = category;
    img.style.display = "block";
  }
  

  // apply search, category and price filters, then render
  function applyFilters() {
    const term      = searchInput.value.trim().toLowerCase();
    const activeBtn = filterContainer.querySelector(".btn.active");
    const category  = activeBtn ? activeBtn.dataset.id : "all";
    const maxPrice  = Number(priceRange.value);

    // update banner and price label
    updateCategoryImage(category);
    priceValue.textContent = "$".repeat(maxPrice);

    let filtered = menuData;

    // filter by category unless "all"
    if (category !== "all") {
      filtered = filtered.filter(i => i.category === category);
    }

    // filter by text search in title or location
    if (term) {
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(term) ||
        (i.location || "").toLowerCase().includes(term)
      );
    }

    // filter out items with more dollar signs than slider allows
    filtered = filtered.filter(i => {
      const count = (i.price.match(/\$/g) || []).length;
      return count <= maxPrice;
    });

    renderItems(filtered);
  }

  // wire up the control events to re-run filtering
  filterContainer.addEventListener("click", e => {
    if (!e.target.matches(".btn")) return;
    filterContainer.querySelectorAll(".btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    applyFilters();
  });

  searchInput.addEventListener("input", applyFilters);
  priceRange.addEventListener("input", applyFilters);

  // render the given array of items into the page
  function renderItems(items) {
    if (items.length === 0) {
      sectionCenter.innerHTML = `<p style="text-align:center;">No items found.</p>`;
      return;
    }

    sectionCenter.innerHTML = items.map(item => `
      <article class="menu-item">
        <img
          src="${item.img}"
          class="photo"
          alt="${item.title}"
          loading="lazy"
        />
        <div class="item-info">
          <header>
            <h4>${item.title}</h4>
            <p class="item-location">${item.location || ""}</p>
            <h4 class="price">${item.price}</h4>
          </header>
          <p class="item-text">${item.desc}</p>
        </div>
      </article>
    `).join("");
  }
});
