document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".section-center");
  let currentLang = localStorage.getItem("lang") || "tr";
  const slider = document.getElementById("slider");
  const leftBtn = document.getElementById("slider-left");
  const rightBtn = document.getElementById("slider-right");
  const slides = slider.querySelectorAll("img");

  let currentIndex = 0;

  function updateSlider() {
    const slideWidth = slider.clientWidth;
    slider.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }

  rightBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlider();
  });

  leftBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlider();
  });
  window.addEventListener("resize", updateSlider); 

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.getAttribute('data-lang');
      localStorage.setItem('lang', currentLang);
      setLanguage(currentLang); 
      loadExploreData();        
    });
  });
  function setWeeklyPick(data, lang) {
    const descKey = lang === "tr" ? "desc_tr" : "desc_en";
    const randomItem = data[Math.floor(Math.random() * data.length)];
  
    const title = randomItem.title;
    const desc = randomItem[descKey];
  
    document.getElementById("weekly-title").textContent = title;
    document.getElementById("weekly-desc").textContent = desc;
  }

  loadExploreData();

  function loadExploreData() {
    fetch("explore.json")
      .then(res => res.json())
      .then(data => {
        const categories = ["Hidden Spots", "History & Culture", "Sea & Sun"];
        const descKey = currentLang === "tr" ? "desc_tr" : "desc_en";
  
        let html = "";
        categories.forEach(cat => {
          const catItems = data.filter(item => item.category === cat);
          if (catItems.length) {
            html += `
              <section class="explore-category" data-cat="${cat}">
                <h2>${cat}</h2>
                <div class="explore-items">
                  ${catItems.map(item => `
                    <article class="menu-item">
                      <img src="${item.img}" class="photo" alt="${item.title}" />
                      <div class="item-info">
                        <h4>${item.title}</h4>
                        <p class="item-location">${item.location}</p>
                        <p class="price">${item.price}</p>
                        <p class="item-text">${item[descKey]}</p>
                      </div>
                    </article>
                  `).join("")}
                </div>
              </section>
            `;
          }
        });
  
        section.innerHTML = html;
  
        setWeeklyPick(data, currentLang);
      })
      .catch(err => {
        section.innerHTML = `<p>Error loading content 😿</p>`;
        console.error(err);
      });
  }
  
});
