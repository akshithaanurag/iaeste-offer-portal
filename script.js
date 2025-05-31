let offers = [];
let selectedOfferIndex = null;
let ncDriveLinks = [];
let winnerFactsheets = [];
let applications = [];


// Login handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const userType = document.getElementById('userType').value;

  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'inline-block';

  if (userType === 'admin' || userType === 'lcAdmin') {
    document.getElementById('adminPage').style.display = 'block';
    displayAdminOffers();
    showAdminTab('lcPostTab');
    displayNCLinks();
    displayWinnerFactsheets();
  } else if (userType === 'member') {
    document.getElementById('memberPage').style.display = 'block';
    displayGroupedOffers();
  } else if (userType === 'ncAdmin') {
    document.getElementById('ncAdminPage').style.display = 'block';
    showAdminTab('ncUploadTab');
    displayWinnerFactsheets();
  } else {
    alert("Please select a user type.");
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to logout?")) logout();
});

function logout() {
  document.getElementById('loginPage').style.display = 'block';
  document.getElementById('adminPage').style.display = 'none';
  document.getElementById('memberPage').style.display = 'none';
  document.getElementById('applySection').style.display = 'none';
  document.getElementById('ncAdminPage').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
}

function showAdminTab(id) {
  // Hide all tab contents and remove active class
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.classList.remove("active");
    tab.style.display = "none";
  });

  // Show the selected tab with animation
  const activeTab = document.getElementById(id);
  activeTab.style.display = "block";
  setTimeout(() => activeTab.classList.add("active"), 10); // slight delay triggers animation

  // Update active button highlight
  document.querySelectorAll(".tabs button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("onclick")?.includes(id)) {
      btn.classList.add("active");
    }
  });
}


// Offer Subcategory Dropdown
function toggleSubCategory() {
  const type = document.getElementById('offerType').value;
  const sub = document.getElementById('offerSubCategory');
  const container = document.getElementById('subCategoryContainer');
  sub.innerHTML = '';
  container.style.display = 'none';

  if (type === 'Global') {
    container.style.display = 'block';
    sub.innerHTML += `<option value="Global COBE Offer">Global COBE Offer</option>`;
    sub.innerHTML += `<option value="Global FCFS Offer">Global FCFS Offer</option>`;
  } else if (type === 'Exchange') {
    container.style.display = 'block';
    sub.innerHTML += `<option value="Open Offer">Open Offer</option>`;
    sub.innerHTML += `<option value="April Offer">April Offer</option>`;
    sub.innerHTML += `<option value="Winter Offer">Winter Offer</option>`;
    sub.innerHTML += `<option value="Autumn Offer">Autumn Offer</option>`;
  }
}

// Post Offer by LC Admin
function postOffer() {
  const mode = document.getElementById('mode').value;
  const type = document.getElementById('offerType').value;
  const subcategory = document.getElementById('offerSubCategory').value || '';
  const description = document.getElementById('description').value.trim();
  const country = document.getElementById('country').value.trim();
  const departmentsRaw = document.getElementById('departments').value.trim();
  const deadline = new Date(document.getElementById('deadline').value);
  const file1 = document.getElementById('offerPdf').files[0];
  const file2 = document.getElementById('instructionPdf').files[0];

  if (!type || !description || !country || !departmentsRaw || !deadline || !mode || !file1 || !file2) {
  alert("Please fill all fields and upload both files.");
  return;
 }

  const reader1 = new FileReader();
  const reader2 = new FileReader();

  reader1.onload = function (e1) {
    const pdfDataUrl1 = e1.target.result;

    reader2.onload = function (e2) {
      const pdfDataUrl2 = e2.target.result;

      const departments = departmentsRaw.toLowerCase() === 'all'
        ? ['All']
        : departmentsRaw.split(',').map(d => d.trim().toLowerCase());

      offers.unshift({
        type,
        subcategory,
        description,
        country,
        departments,
        deadline,
        mode,
        pdfDataUrl1,
        pdfDataUrl2
      });

      clearAdminForm();
      displayAdminOffers();
      displayGroupedOffers(); // ✅ ADD THIS LINE
      alert("Offer posted successfully.");
    };

    reader2.readAsDataURL(file2);
  };

  reader1.readAsDataURL(file1);
}

function clearAdminForm() {
  document.getElementById('offerType').value = '';
  document.getElementById('offerSubCategory').value = '';
  document.getElementById('description').value = '';
  document.getElementById('country').value = '';
  document.getElementById('departments').value = '';
  document.getElementById('deadline').value = '';
  document.getElementById('offerPdf').value = '';
  document.getElementById('instructionPdf').value = '';
  document.getElementById('subCategoryContainer').style.display = 'none';
}

// Admin Offer Display
function displayAdminOffers() {
  const container = document.getElementById('admin-offer-list');
  container.innerHTML = '';
  const now = new Date();

  offers.forEach((offer, index) => {
    if (offer.deadline <= now) return;
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${offer.type}${offer.subcategory ? " - " + offer.subcategory : ""}</strong> — 
      Deadline: ${offer.deadline.toLocaleString()}
      <button onclick="deleteOffer(${index})">Delete</button>
    `;
    container.appendChild(li);
  });
  
}

function deleteOffer(index) {
  if (confirm("Delete this offer?")) {
    offers.splice(index, 1);
    displayAdminOffers();
    displayGroupedOffers();
  }
}

// Display Offers for Members
function displayGroupedOffers(filtered = offers) {
  const now = new Date();
  const clear = id => document.getElementById(id).innerHTML = '';
  const groupIds = [
    "global-cobe-offers", "global-fcfs-offers", "open-offers",
    "april-offers", "winter-offers", "autumn-offers", "reserved-offers"
  ];
  groupIds.forEach(clear);
  document.getElementById('no-offers').style.display = "none";

  let found = 0;

  filtered.forEach((offer, index) => {
    if (offer.deadline <= now) return;

    const card = document.createElement('div');
    card.className = 'offer-card';
    card.innerHTML = `
      <strong>${offer.type}${offer.subcategory ? " - " + offer.subcategory : ""}</strong>
      <em>${offer.description}</em>
      Country: ${offer.country}<br>
      Mode: ${offer.mode}<br>
      Departments: ${offer.departments.join(', ')}<br>
      Deadline: ${offer.deadline.toLocaleString()}<br>
      <button onclick="openApply(${index})">Apply</button>
    `;

    let targetId = '';
    if (offer.type === 'Global') {
      targetId = offer.subcategory === 'Global FCFS Offer' ? 'global-fcfs-offers' : 'global-cobe-offers';
    } else if (offer.type === 'Exchange') {
      const map = {
        "Open Offer": "open-offers",
        "April Offer": "april-offers",
        "Winter Offer": "winter-offers",
        "Autumn Offer": "autumn-offers"
      };
      targetId = map[offer.subcategory];
    } else if (offer.type === 'Reserved') {
      targetId = 'reserved-offers';
    }

    if (targetId && document.getElementById(targetId)) {
      document.getElementById(targetId).appendChild(card);
      found++;
    }
  });

  if (found === 0) {
    document.getElementById('no-offers').style.display = "block";
  }
}

// Apply Logic
function openApply(index) {
  selectedOfferIndex = index;
  const offer = offers[index];
  document.getElementById('adminFileLink1').href = offer.pdfDataUrl1;
  document.getElementById('adminFileLink2').href = offer.pdfDataUrl2;

  document.getElementById('applySection').style.display = 'block';
  document.getElementById('memberPage').style.display = 'none';
}

function backToOffers() {
  document.getElementById('applySection').style.display = 'none';
  document.getElementById('memberPage').style.display = 'block';
}

function submitApplication() {
  const file1 = document.getElementById('uploadUndertaking').files[0];
  const file2 = document.getElementById('uploadFactsheet').files[0];

  if (!file1 || !file2) {
    alert('Please upload both required files.');
    return;
  }

  const reader1 = new FileReader();
  const reader2 = new FileReader();

  reader1.onload = function (e1) {
    const file1DataUrl = e1.target.result;

    reader2.onload = function (e2) {
      const file2DataUrl = e2.target.result;

      const offer = offers[selectedOfferIndex];
      const appId = "APP-" + Math.floor(100000 + Math.random() * 900000); // Unique ID

      applications.unshift({
        id: appId,
        offerTitle: offer.type + (offer.subcategory ? " - " + offer.subcategory : ""),
        time: new Date().toLocaleString(),
        file1Name: file1.name,
        file2Name: file2.name,
        file1Url: file1DataUrl,
        file2Url: file2DataUrl
      });

      alert(`✅ Application submitted!\n\nYour ID: ${appId}`);
      document.getElementById('uploadUndertaking').value = '';
      document.getElementById('uploadFactsheet').value = '';
      backToOffers();
      displayApplications();
    };

    reader2.readAsDataURL(file2);
  };

  reader1.readAsDataURL(file1);
}




// Filters
function applyFilters() {
  const country = document.getElementById('filter-country').value.trim().toLowerCase();
  const mode = document.getElementById('filter-mode').value;
  const dept = document.getElementById('filter-department').value.trim().toLowerCase();

  const filtered = offers.filter(o => {
    const now = new Date();
    if (o.deadline <= now) return false;
    const matchCountry = !country || o.country.toLowerCase() === country;
    const matchDept = o.departments.includes('All') || o.departments.includes(dept);
    return matchCountry && matchDept;
  });

  displayGroupedOffers(filtered);
}

// NC Admin: Upload Drive Link
function uploadDriveLink() {
  const link = document.getElementById('ncDriveLink').value;
  const org = document.getElementById('ncTargetOrg').value;
  if (!link || !org || !link.startsWith('http')) {
    alert("Please enter a valid Drive link and select committee.");
    return;
  }

  ncDriveLinks.unshift({ link, org }); // ✅ Newest link first

  displayNCLinks();
  document.getElementById('ncDriveLink').value = '';
  document.getElementById('ncUploadSuccess').style.display = 'block';
  setTimeout(() => document.getElementById('ncUploadSuccess').style.display = 'none', 2000);
}

function displayNCLinks() {
  const list = document.getElementById('ncOfferLinks');
  if (!list) return;
  list.innerHTML = '';
  ncDriveLinks.forEach(obj => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${obj.link}" target="_blank">${obj.org} - View Offer</a>`;
    list.appendChild(li);
  });
}

// Dynamically update second dropdown based on first select
function updateTargetOptions() {
  const type = document.getElementById('ncUploadType').value;
  const targetSelect = document.getElementById('ncTargetOrg');
  targetSelect.innerHTML = ''; // Clear current options

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Select Committee/Institution --';
  targetSelect.appendChild(defaultOption);

  let options = [];
  if (type === "Local Committees") {
    options = ["LC MU", "LC MUJ", "LC KU", "LC JECRC"];
  } else if (type === "Cooperating Institutions") {
    options = ["Sikkim Manipal University", "Rajagiri Business School"];
  }

  options.forEach(org => {
    const opt = document.createElement('option');
    opt.value = org;
    opt.textContent = org;
    targetSelect.appendChild(opt);
  });
}

// LC Admin: Upload Winner Factsheet
function uploadWinnerFactsheet() {
  const title = document.getElementById('winnerFactsheetTitle').value.trim();
  const link = document.getElementById('winnerFactsheetLink').value.trim();

  if (!title || !link || !link.startsWith("http")) {
    alert("Please enter a valid heading and Google Drive link.");
    return;
  }

  winnerFactsheets.unshift({
    name: title,
    url: link
  });

  displayWinnerFactsheets();
  document.getElementById('winnerFactsheetTitle').value = '';
  document.getElementById('winnerFactsheetLink').value = '';
  alert("Link uploaded successfully.");
}


// NC Admin: View uploaded Factsheets
function displayWinnerFactsheets() {
  const list = document.getElementById('winnerFactsList');
  if (!list) return;
  list.innerHTML = '';
  winnerFactsheets.forEach(f => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${f.url}" target="_blank">${f.name}</a>`;
    list.appendChild(li);
  });
}


function displayApplications() {
  const list = document.getElementById('applicationList');
  if (!list) return;

  list.innerHTML = '';

  applications.forEach(app => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>ID:</strong> ${app.id}<br>
      <strong>Offer:</strong> ${app.offerTitle}<br>
      <strong>Submitted:</strong> ${app.time}<br>
      <a href="${app.file1Url}" target="_blank">📄 ${app.file1Name}</a><br>
      <a href="${app.file2Url}" target="_blank">📄 ${app.file2Name}</a>
    `;
    list.appendChild(li);
  });
}
