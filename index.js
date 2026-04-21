// MAIN API - GET https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/{english}
// ALL ITEMS API - GET https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/all.json
// SKINS API W RARIY GROUPING - GET https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json


// NAVIGATION MODAL TOGGLE 
let isModalOpen = false;
function toggleModal() {
  if (isModalOpen) {
    document.body.classList.remove("modal__menu--open");
    isModalOpen = false;
    console.log("NAV MODAL CLOSED");
    return;
  }
  isModalOpen = true;
  document.body.classList.toggle("modal__menu--open");
  console.log("NAV MODAL OPENED");
}






// Store all skins data globally for modal access
let allSkinsData = [];``

// SEARCH SKINS FUNCTION
async function searchSkins(query) {
  const response = await fetch(
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json",
  );
  const skins = await response.json();
  const filtered = skins.filter(skin => skin.name.toLowerCase().includes(query.toLowerCase()));
  return filtered.slice(0,6);
}

// SEARCH BUTTON HANDLER

const loadingDiv = document.querySelector('.loading');
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.content-searchbar');

// Function to execute search
async function executeSearch() {
  try {
    loadingDiv.style.display = 'block';
    const searchQuery = searchInput.value;

    const results = await searchSkins(searchQuery);
    
    // Ensure loading displays for at least 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    await displaySearchResults(results);
   
  } catch (error) {
    console.error('Error searching skins:', error);
  } finally {
    loadingDiv.style.display = 'none';
  }
}

// Search button click handler
if (searchBtn) {
  searchBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    executeSearch();
  });
}

// Search input enter key handler
if (searchInput) {
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      executeSearch();
    }
  });
}


// SEARCH FUNCTION - FETCHES SKINS DATA AND FILTERS IT BASED ON SEARCH QUERY
function displaySearchResults(results) {
  const resultsContainer = document.querySelector('.search-results');
  
  if (!resultsContainer) {
    return;
  }
  
  if (results.length === 0) {
    resultsContainer.innerHTML = '<p>No skins found</p>';
    resultsContainer.classList.add('active');
    return;
  }
  
  const html = results.map(skin => `
    <div class="result-skin">
      <img src="${skin.image}" alt="${skin.name}" class="skin-image" data-skin-id="${skin.id}">
      <h4 class="name">${skin.name}</h4>
      <p class="rarity rarity--${skin.rarity.name.toLowerCase().replace(/ /g, '-')}">${skin.rarity.name}</p>
    </div>
  `).join('');
  
  resultsContainer.innerHTML = html;
  resultsContainer.classList.add('active');
  
  // Add click listeners to search result images
  const resultImages = resultsContainer.querySelectorAll('.skin-image');
  resultImages.forEach(img => {
    img.addEventListener('click', (event) => {
      const skinId = event.target.getAttribute('data-skin-id');
      const skin = allSkinsData.find(s => s.id === skinId);
      if (skin) showSkinModal(skin);
    });
  });
}

// Function to show skin modal
function showSkinModal(skin) {
  const modal = document.querySelector('.skin-modal');
  const modalContent = modal.querySelector('.modal-content');
  
  modalContent.innerHTML = `
    <button class="modal-close" onclick="closeSkinModal()">&times;</button>
    <img src="${skin.image}" alt="${skin.name}" class="modal-img">
    <h2 class="modal-name">${skin.name}</h2>
    <p class="modal-rarity rarity--${skin.rarity.name.toLowerCase().replace(/ /g, '-')}">${skin.rarity.name}</p>
    <p class="modal-description">${skin.description || 'No description available'}</p>
  `;
  
  modal.classList.add('active');
}

// Function to close skin modal
function closeSkinModal() {
  const modal = document.querySelector('.skin-modal');
  modal.classList.remove('active');
}

// Close modal when clicking outside content
document.addEventListener('click', (event) => {
  const modal = document.querySelector('.skin-modal');
  if (event.target === modal) {
    closeSkinModal();
  }
});


// FETCH SKINS DATA AND START SLIDESHOW
async function getSkinData() {
  const skins = await fetch("https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json")
  const skinsData = await skins.json();
  allSkinsData = skinsData; // Store for modal access
  console.log(skinsData)
  
  // Initialize the random skin slideshow
  new RandomSkinSlideshow(skinsData);
}

// Only run slideshow on index.html, not on browse.html
const isHomePage = !window.location.pathname.includes('browse');
if (isHomePage) {
  getSkinData();
}

// Random Skin Slideshow Class
class RandomSkinSlideshow {
  constructor(skinsArray) {
    this.skins = skinsArray;
    this.container = document.querySelector('.image__test');
    this.currentSkinIndex = null;
    this.intervalSpeed = 3000; // 3 seconds per skin
    
    // Display first random skin
    this.showNextSkin();
    
    // Start the slideshow
    setInterval(() => this.showNextSkin(), this.intervalSpeed);
  }
  
  getRandomSkin() {
    let randomIndex;
    
    // Keep generating random index until it's different from current
    do {
      randomIndex = Math.floor(Math.random() * this.skins.length);
    } while (randomIndex === this.currentSkinIndex);
    
    this.currentSkinIndex = randomIndex;
    return this.skins[randomIndex];
  }
  
  showNextSkin() {
    const skin = this.getRandomSkin();
    
    // Slide out the old image to the left
    const currentImg = this.container.querySelector('.skinImg');
    if (currentImg) {
      currentImg.style.animation = 'slideOut 0.5s ease-in-out forwards';
    }
    
    // After slide out animation, add new image and slide it in
    setTimeout(() => {
      this.container.innerHTML = `
        <div class="item">
          <img src="${skin.image}" alt="${skin.name}" class="skinImg" data-skin-id="${skin.id}" style="animation: slideIn 0.5s ease-in-out forwards; cursor: pointer;">
        </div>
        <div class="item--name">
              <h4 class="name">${skin.name}</h4>
              <h4 class="rarity rarity--${skin.rarity.name.toLowerCase().replace(/ /g, '-')}">${skin.rarity.name}</h4>
            </div>
      `;
      
      // Add click listener to slideshow image
      const slideshowImg = this.container.querySelector('.skinImg');
      slideshowImg.addEventListener('click', (event) => {
        const skinId = event.target.getAttribute('data-skin-id');
        const clickedSkin = allSkinsData.find(s => s.id === skinId);
        if (clickedSkin) showSkinModal(clickedSkin);
      });
    }, 500);
  }
}

function toggleDarkTheme() {
  const appbody = document.querySelector('#app');
  appbody.classList.toggle('dark-theme');
}
  