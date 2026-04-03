// Browse page category filtering logic

let allBrowseSkinsData = [];
let selectedCategories = new Set();
let selectedRarities = new Set();

const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
const rarityCheckboxes = document.querySelectorAll('.rarity-checkbox');
const searchBtn = document.querySelector('.search-btn');
const loadingDiv = document.querySelector('.loading');
const searchInput = document.querySelector('.content-searchbar');

// Add event listeners to category checkboxes
categoryCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', (event) => {
    const value = event.target.value;
    const isChecked = event.target.checked;
    
    if (isChecked) {
      selectedCategories.add(value);
    } else {
      selectedCategories.delete(value);
    }
    
    console.log('Selected categories:', Array.from(selectedCategories));
  });
});

// Add event listeners to rarity checkboxes
rarityCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', (event) => {
    const value = event.target.value;
    const isChecked = event.target.checked;
    
    if (isChecked) {
      selectedRarities.add(value);
    } else {
      selectedRarities.delete(value);
    }
    
    console.log('Selected rarities:', Array.from(selectedRarities));
  });
});

// Function to execute search with filters
async function executeBrowseSearch() {
  try {
    loadingDiv.style.display = 'block';
    const searchQuery = searchInput.value;
    
    // Filter by selected categories AND rarities AND search query
    let results = allBrowseSkinsData;
    
    // If categories are selected, filter by them
    if (selectedCategories.size > 0) {
      results = results.filter(skin => 
        selectedCategories.has(skin.category.name)
      );
    }
    
    // If rarities are selected, filter by them
    if (selectedRarities.size > 0) {
      results = results.filter(skin => 
        selectedRarities.has(skin.rarity.name)
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      results = results.filter(skin => 
        skin.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Ensure loading displays for at least 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await displaySearchResults(results.slice(0, 6));
    
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
    executeBrowseSearch();
  });
}

// Search input enter key handler
if (searchInput) {
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      executeBrowseSearch();
    }
  });
}

// Function to display search results (same as index.js)
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
      const skin = allBrowseSkinsData.find(s => s.id === skinId);
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

// Fetch all skins data on page load
async function initializeBrowsePage() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json");
    allBrowseSkinsData = await response.json();
    console.log('Browse page skins loaded:', allBrowseSkinsData.length);
  } catch (error) {
    console.error('Error fetching skins data:', error);
  }
}

function toggleDarkTheme() {
  const appbody = document.querySelector("#app");
  appbody.classList.toggle("dark-theme");
}
  

// Initialize on page load
initializeBrowsePage();
