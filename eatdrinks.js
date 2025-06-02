document.addEventListener("DOMContentLoaded", () => {
  const sectionCenter   = document.querySelector(".section-center");
  const filterContainer = document.querySelector(".filter-btn-container");
  const searchInput     = document.getElementById("search-input");
  const priceRange      = document.getElementById("price-range");
  const priceValue      = document.getElementById("price-value");

  let menuData    = [];
  let currentLang = localStorage.getItem("lang") || "tr";

  // --- DİL DEĞİŞİMİ: Butonlar üzerinden ---
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.getAttribute('data-lang');
      localStorage.setItem('lang', currentLang);
      // Sayfa statik metinleri güncelle (i18n.js zaten var)
      setLanguage(currentLang);
      // Menü açıklamalarını da güncelle
      applyFilters();
    });
  });

  // menu.json’dan yükle
  fetch("menu.json")
    .then(res => res.json())
    .then(data => {
      menuData = data;
      setupFilterButtons(menuData);
      applyFilters();
    })
    .catch(err => console.error("Failed to load menu:", err));

  function setupFilterButtons(data) {
    const cats = data.reduce((a,{category})=>{
      if (!a.includes(category)) a.push(category);
      return a;
    }, ["all"]);
    filterContainer.innerHTML = cats.map(c=>`<button class="btn" data-id="${c}">${c}</button>`).join("");
    const allBtn = filterContainer.querySelector('[data-id="all"]');
    allBtn && allBtn.classList.add("active");
  }

  function updateCategoryImage(category) {
    const img = document.getElementById("category-img");
    if (category === "all") {
      img.src = "./assets/all.png";
      img.alt = "All Categories";
      img.style.display = "block";
      return;
    }
    const slug = category
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/\s+|\//g, "-");
    img.src = `./assets/${slug}.png`;
    img.alt = category;
    img.style.display = "block";
  }

  function applyFilters() {
    const term      = searchInput.value.trim().toLowerCase();
    const activeBtn = filterContainer.querySelector(".btn.active");
    const category  = activeBtn ? activeBtn.dataset.id : "all";
    const maxPrice  = Number(priceRange.value);

    updateCategoryImage(category);
    priceValue.textContent = "$".repeat(maxPrice);

    let filtered = menuData
      .filter(i => category==="all" ? true : i.category===category)
      .filter(i =>
        !term ||
        i.title.toLowerCase().includes(term) ||
        (i.location||"").toLowerCase().includes(term)
      )
      .filter(i => ((i.price.match(/\$/g)||[]).length) <= maxPrice);

    renderItems(filtered);
  }

  function renderItems(items) {
    if (items.length===0) {
      sectionCenter.innerHTML = `<p style="text-align:center;">No items found.</p>`;
      return;
    }
    sectionCenter.innerHTML = items.map(item => {
      // seçili dile göre doğru açıklamayı al
      const descKey = currentLang==="tr" ? "desc_tr" : "desc_en";
      return `
      <article class="menu-item">
        <img src="${item.img}" class="photo" alt="${item.title}" loading="lazy"/>
        <div class="item-info">
          <header>
            <h4>${item.title}</h4>
            <p class="item-location">${item.location||""}</p>
            <h4 class="price">${item.price}</h4>
          </header>
          <p class="item-text">${item[descKey]}</p>
        </div>
      </article>`;
    }).join("");
  }

  // event listener’lar
  filterContainer.addEventListener("click", e => {
    if (!e.target.matches(".btn")) return;
    filterContainer.querySelectorAll(".btn").forEach(b=>b.classList.remove("active"));
    e.target.classList.add("active");
    applyFilters();
  });
  searchInput.addEventListener("input", applyFilters);
  priceRange.addEventListener("input", applyFilters);
});
