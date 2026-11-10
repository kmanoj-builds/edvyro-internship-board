
import { internships as fallbackInternships } from "./data.js";

let internships = [...fallbackInternships];
const API_BASE_URL = window.INTERNBOARD_API_URL || "http://localhost:5000/api";

// ========================================
// 1. DOM ELEMENTS
// ========================================

// Statistics
const totalInternshipsElement = document.getElementById("total-internships");
const totalDomainsElement = document.getElementById("total-domains");
const totalOpeningsElement = document.getElementById("total-openings");

// Filters
const searchInput = document.getElementById("search-input");
const domainFilter = document.getElementById("domain-filter");
const modeFilter = document.getElementById("mode-filter");
const filterForm = document.getElementById("filter-form");

// Internship listings
const internshipList = document.getElementById("internship-list");
const statusMessage = document.getElementById("status-message");
const resultsCount = document.getElementById("results-count");

// Internship details modal
const internshipModal = document.getElementById("internship-modal");
const detailsView = document.getElementById("internship-details-view");

const modalTitle = document.getElementById("modal-title");
const modalId = document.getElementById("modal-id");
const modalDomain = document.getElementById("modal-domain");
const modalLocation = document.getElementById("modal-location");
const modalMode = document.getElementById("modal-mode");
const modalOpenings = document.getElementById("modal-openings");
const modalSkills = document.getElementById("modal-skills");

const closeModalButton = document.getElementById("close-modal");
const applyButton = document.getElementById("apply-button");

// Application form elements
const applicationView = document.getElementById("application-view");
const applicationForm = document.getElementById("application-form");

const applicationInternshipId = document.getElementById(
  "application-internship-id"
);

const applicationInternshipTitle = document.getElementById(
  "application-internship-title"
);

const applicantName = document.getElementById("applicant-name");
const applicantEmail = document.getElementById("applicant-email");
const applicantPhone = document.getElementById("applicant-phone");
const resumeUrl = document.getElementById("resume-url");
const portfolioUrl = document.getElementById("portfolio-url");

const applicationMessage = document.getElementById("application-message");

const backToDetailsButton = document.getElementById("back-to-details");

const closeApplicationModalButton = document.getElementById(
  "close-application-modal"
);

const submitApplicationButton = document.getElementById(
  "submit-application"
);

// ========================================
// 2. UPDATE STATISTICS
// ========================================

function updateStatistics() {
  const totalInternships = internships.length;

  const totalDomains = new Set(
    internships.map((internship) => internship.domain)
  ).size;

  const totalOpenings = internships.reduce(
    (total, internship) =>     total + (Number(internship.openings) || 0),
    0
  );

  totalInternshipsElement.textContent = totalInternships;
  totalDomainsElement.textContent = totalDomains;
  totalOpeningsElement.textContent = totalOpenings;
}

// ========================================
// 3. POPULATE DOMAIN FILTER
// ========================================

function populateDomainFilter() {
  const domains = [
    ...new Set(internships.map((internship) => internship.domain)),
  ];

  domains.forEach((domain) => {
    const option = document.createElement("option");

    option.value = domain;
    option.textContent = domain;

    domainFilter.appendChild(option);
  });
}

// ========================================
// 4. OPEN INTERNSHIP DETAILS MODAL
// ========================================

function openInternshipDetails(internship) {
  modalTitle.textContent = internship.title;
  modalId.textContent = internship.id;
  modalDomain.textContent = internship.domain;
  modalLocation.textContent = internship.location;
  modalMode.textContent = internship.mode;
  modalOpenings.textContent = internship.openings;

  // Render internship skills
  modalSkills.replaceChildren();

  internship.skills.forEach((skill) => {
    const badge = document.createElement("span");

    badge.className = "skill-badge";
    badge.textContent = skill;

    modalSkills.appendChild(badge);
  });

  // Store selected internship information
  applyButton.dataset.internshipId = internship.id;
  applicationInternshipId.value = internship.id;
  applicationInternshipTitle.textContent = internship.title;

  // Reset application view
  applicationForm.reset();
  applicationInternshipId.value = internship.id;
  applicationInternshipTitle.textContent = internship.title;

  applicationMessage.textContent = "";

  // Show details view first
  detailsView.hidden = false;
  applicationView.hidden = true;

  // Open modal
  internshipModal.showModal();
}

// ========================================
// 5. CREATE INTERNSHIP CARD
// ========================================

function createInternshipCard(internship) {
  const card = document.createElement("article");

  card.className = "internship-card";

  // Card Header
  const header = document.createElement("div");
  header.className = "card-header";

  // Internship ID
  const id = document.createElement("span");
  id.className = "internship-id";
  id.textContent = internship.id;

  // Work Mode
  const mode = document.createElement("span");
  mode.className = "mode-badge";
  mode.textContent = internship.mode;

  header.append(id, mode);

  // Internship Title
  const title = document.createElement("h3");
  title.textContent = internship.title;

  // Domain
  const domain = document.createElement("p");
  domain.className = "card-domain";
  domain.textContent = internship.domain;

  // Location
  const location = document.createElement("p");
  location.className = "card-location";
  location.textContent = `📍 ${internship.location}`;

  // Skills Container
  const skillsContainer = document.createElement("div");
  skillsContainer.className = "skills-container";

  internship.skills.forEach((skill) => {
    const badge = document.createElement("span");

    badge.className = "skill-badge";
    badge.textContent = skill;

    skillsContainer.appendChild(badge);
  });

  // Card Footer
  const footer = document.createElement("div");
  footer.className = "card-footer";

  // Openings
  const openings = document.createElement("span");
  openings.className = "openings";

  openings.textContent =
    `${internship.openings} opening${internship.openings === 1 ? "" : "s"}`;

  // View Details Button
  const detailsButton = document.createElement("button");

  detailsButton.className = "details-button";
  detailsButton.type = "button";
  detailsButton.textContent = "View details";

  detailsButton.setAttribute(
    "aria-label",
    `View details for ${internship.title}`
  );

  detailsButton.addEventListener("click", () => {
    openInternshipDetails(internship);
  });

  footer.append(openings, detailsButton);

  // Append Everything to Card
  card.append(
    header,
    title,
    domain,
    location,
    skillsContainer,
    footer
  );

  return card;
}

// ========================================
// 6. RENDER INTERNSHIPS
// ========================================

function renderInternships(records) {
  internshipList.replaceChildren();

  // Empty State
  if (records.length === 0) {
    statusMessage.textContent =
      "No internships found. Try changing your search or filters.";

    resultsCount.textContent = "0 internships found";

    return;
  }

  statusMessage.textContent = "";

  // Create Document Fragment
  const fragment = document.createDocumentFragment();

  records.forEach((internship) => {
    const card = createInternshipCard(internship);
    fragment.appendChild(card);
  });

  internshipList.appendChild(fragment);

  // Update Result Count
  resultsCount.textContent = `${records.length} internships found`;
}

// ========================================
// 7. SEARCH AND FILTER INTERNSHIPS
// ========================================

function filterInternships() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedDomain = domainFilter.value;
  const selectedMode = modeFilter.value;

  const filteredRecords = internships.filter((internship) => {
    // Search across title, domain, location and skills
    const searchableContent = [
      internship.title,
      internship.domain,
      internship.location,
      ...internship.skills,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableContent.includes(searchTerm);

    const matchesDomain =
      selectedDomain === "all" ||
      internship.domain === selectedDomain;

    const matchesMode =
      selectedMode === "all" ||
      internship.mode === selectedMode;

    return matchesSearch && matchesDomain && matchesMode;
  });

  renderInternships(filteredRecords);
}

// ========================================
// 8. APPLICATION FORM FUNCTIONS
// ========================================

// Open application form
function openApplicationForm() {
  detailsView.hidden = true;
  applicationView.hidden = false;

  applicationMessage.textContent = "";

  // Ensure the correct internship ID is stored
  applicationInternshipId.value = applyButton.dataset.internshipId;

  applicantName.focus();
}

// Return to internship details
function returnToDetails() {
  applicationView.hidden = true;
  detailsView.hidden = false;

  applicationMessage.textContent = "";

  applyButton.focus();
}

// ========================================
// 9. APPLICATION FORM SUBMISSION
// ========================================

async function handleApplicationSubmit(event) {
  event.preventDefault();

  // Validate all required fields and input types
  if (!applicationForm.reportValidity()) {
    return;
  }

  const applicationData = {
    internshipId: applicationInternshipId.value,
    name: applicantName.value.trim(),
    email: applicantEmail.value.trim(),
    phone: applicantPhone.value.trim(),
    resumeUrl: resumeUrl.value.trim(),
    portfolioUrl: portfolioUrl.value.trim(),
  };

  submitApplicationButton.disabled = true;
  applicationMessage.classList.remove("success-message");
  applicationMessage.textContent = "Submitting your application...";

  try {
    const response = await fetch(
      `${API_BASE_URL}/internships/${encodeURIComponent(applicationData.internshipId)}/applications`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: applicationData.name,
          email: applicationData.email,
        }),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Application submission failed.");
    }
    applicationMessage.textContent = result.message;
    applicationMessage.classList.add("success-message");
    submitApplicationButton.textContent = "Submitted";
  } catch (error) {
    applicationMessage.textContent =
      `${error.message} Please check that the backend is running and try again.`;
    submitApplicationButton.disabled = false;
  }
}

// ========================================
// 10. MODAL EVENT LISTENERS
// ========================================

// Close internship details
closeModalButton.addEventListener("click", () => {
  internshipModal.close();
});

// Close application form
closeApplicationModalButton.addEventListener("click", () => {
  internshipModal.close();
});

// Close modal when clicking outside dialog content
internshipModal.addEventListener("click", (event) => {
  if (event.target === internshipModal) {
    internshipModal.close();
  }
});

// Apply Now button
applyButton.addEventListener("click", openApplicationForm);

// Back button
backToDetailsButton.addEventListener("click", returnToDetails);

// Application form submission
applicationForm.addEventListener("submit", handleApplicationSubmit);

// Reset application state when modal closes
internshipModal.addEventListener("close", () => {
  applicationForm.reset();

  detailsView.hidden = false;
  applicationView.hidden = true;

  applicationMessage.textContent = "";

  submitApplicationButton.disabled = false;
  submitApplicationButton.textContent = "Submit Application";
});

// ========================================
// 11. FILTER EVENT LISTENERS
// ========================================

searchInput.addEventListener("input", filterInternships);

domainFilter.addEventListener("change", filterInternships);

modeFilter.addEventListener("change", filterInternships);

// Prevent filter form submission from refreshing page
filterForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

// Clear filters
filterForm.addEventListener("reset", () => {
  setTimeout(() => {
    filterInternships();
  }, 0);
});

// ========================================
// 12. INITIALIZE APPLICATION
// ========================================

async function initializeApp() {
  try {
    const response = await fetch(`${API_BASE_URL}/internships`);
    if (!response.ok) {
      throw new Error(`Backend returned HTTP ${response.status}.`);
    }
    const result = await response.json();
    if (!Array.isArray(result.data)) {
      throw new Error("Backend returned invalid internship data.");
    }
    internships = result.data.map((internship) => ({
      ...internship,
      location: internship.location || "Location not specified",
      skills: Array.isArray(internship.skills) ? internship.skills : [],
      openings: Number(internship.openings) || 0,
    }));
    updateStatistics();
    populateDomainFilter();
    renderInternships(internships);
  } catch (error) {
    console.warn("Backend unavailable; using local internship data.", error);
    internships = [...fallbackInternships];
    updateStatistics();
    populateDomainFilter();
    renderInternships(internships);
    statusMessage.textContent = "Backend unavailable. Showing local sample data.";
  }
}

// Start Application
initializeApp();
