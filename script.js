
// CONFIGURATION
const API_KEY = "76b075f1";

// -- Base URL for every API request. We append the search query later.
const API_BASE = "https://www.omdbapi.com/";

// GRABBING REFERENCES TO HTML ELEMENTS

const searchInput = document.getElementById("searchInput"); // the text box
const searchBtn = document.getElementById("searchBtn"); // "Search" button
const clearBtn = document.getElementById("clearBtn"); // "Clear" button
const statusMessage = document.getElementById("statusMessage"); // feedback text
const charCount = document.getElementById("charCount"); // live char counter
const movieGrid = document.getElementById("movieGrid"); // container for results
const watchlistGrid = document.getElementById("watchlistGrid"); // container for watchlist
const watchlistEmpty = document.getElementById("watchlistEmpty"); // "empty" notice
const watchlistBadge = document.getElementById("watchlistBadge"); // number badge
const themeToggle = document.getElementById("themeToggle"); // dark/light btn

// IN-MEMORY WATCHLIST ARRAY

let watchlist = [];

// 4. THEME SWITCHER (Dark / Light Mode)

themeToggle.addEventListener("click", function () {
  // classList.toggle adds the class if it's missing, removes it if present
  document.body.classList.toggle("dark-mode");

  // Check whether dark mode is NOW active
  if (document.body.classList.contains("dark-mode")) {
    // Dark mode is on → show "Light Mode" option
    themeToggle.textContent = "☀️ Light Mode";
  } else {
    // Dark mode is off → show "Dark Mode" option
    themeToggle.textContent = "🌙 Dark Mode";
  }
});


// LIVE CHARACTER COUNTER
// ============================================================
// -- The "input" event fires on every keystroke inside the text box.
//    We read the current value and update the counter paragraph.

searchInput.addEventListener("input", function () {
  const length = searchInput.value.length;
  charCount.textContent =
    length + (length === 1 ? " character" : " characters");
});

// SEARCH — TRIGGERING THE API CALL

// (a) Button click
searchBtn.addEventListener("click", handleSearch);

// (b) Enter key
searchInput.addEventListener("keydown", function (event) {
  // event.key tells us which key was pressed
  if (event.key === "Enter") {
    handleSearch();
  }
});

// -- handleSearch is the "entry point" for every search.
//    It validates the input, then calls fetchMovies().
function handleSearch() {
  // Trim removes extra spaces from the start and end
  const query = searchInput.value.trim();

  // Don't run an API call if the input is empty
  if (query === "") {
    showStatus("Please type a movie name first.", true); // true = error style
    return; // "return" exits the function early
  }

  // Call the async function that actually talks to the API
  fetchMovies(query);
}


// FETCHING DATA FROM THE OMDb API

async function fetchMovies(query) {
  // Show a loading message while we wait
  showStatus("🔄 Searching…", false);

  // Build the full URL. Template literals (backticks) let us insert variables.
  const url = `${API_BASE}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
  // encodeURIComponent makes the query safe for URLs (e.g. spaces → %20)

  try {
    // --- STEP 1: Send the request and wait for the response object ---
    const response = await fetch(url);

    // If the network request itself failed (e.g. no internet), response is not ok
    if (!response.ok) {
      throw new Error("Network error — could not reach the API.");
    }

    // --- STEP 2: Parse the response body as JSON ---
    // The API returns text; .json() converts it into a JavaScript object.
    const data = await response.json();

    // --- STEP 3: Check what the API told us ---
    if (data.Response === "False") {
      // The API returns Response: "False" when no movies match
      showStatus("😕 No movies found. Try a different search term!", true);
      document.getElementById("movieGrid").innerHTML = ""; // clear any old results
      showClearBtn(false); // hide the clear button
      return; // stop here — nothing to render
    }

    // --- STEP 4: We have results! Render them. ---
    // data.Search is an array of movie objects from the API
    renderMovieCards(data.Search);
    showStatus(
      `✅ Found ${data.Search.length} result(s) for "${query}"`
    );
    showClearBtn(true); // show the clear button now that results exist
  } catch (error) {
    // catch() runs if anything above threw an error
    // This handles network failures, bad API keys, JSON parse errors, etc.
    showStatus("❌ " + error.message, true);
    document.getElementById("movieGrid").innerHTML = "";
    showClearBtn(false);

    console.error("Error fetching data from OMDb API:", error);
  }
}


// RENDERING MOVIE CARDS INTO THE GRID

function renderMovieCards(movies) {
  // Re-grab the grid fresh every time so we always have the live element.

  const grid = document.getElementById("movieGrid");

  // Clear any previously displayed cards
  grid.innerHTML = "";

  // Loop through every movie object in the array
  movies.forEach(function (movie, index) {
    // --- Create the outer card container ---
    const card = document.createElement("div");
    card.classList.add("movie-card");
    // Store the IMDb ID as a data attribute so we can find this card later
    card.setAttribute("data-imdbid", movie.imdbID);

    // --- Poster image ---
    // The API gives us a poster URL. "N/A" means no poster is available.
    const posterSrc = movie.Poster !== "N/A" ? movie.Poster : "";

    // --- Build the card's HTML using a template literal ---
    // Everything between the backticks is a string; ${} inserts variables.
    card.innerHTML = `
      <!-- The poster image at the top -->
      <img class="poster" src="${posterSrc}" alt="Poster for ${movie.Title}" />

      <!-- Info section: title, year, type, and the watchlist button -->
      <div class="card-info">
        <h3 class="card-title">${movie.Title}</h3>
        <p class="card-meta">${movie.Year} • ${movie.Type}</p>

        <!-- 
          The "Add to Watchlist" button.
          We check if this movie is already in the watchlist array 
          so we can show the correct button state from the start.
        -->
        <button class="btn-watchlist" data-imdbid="${movie.imdbID}">
          ${isInWatchlist(movie.imdbID) ? "✓ Added" : "⭐ Add to Watchlist"}
        </button>
      </div>

      <!-- 
        Details panel — hidden by default.
        Clicking the card toggles the .open class on this element.
        We put placeholder text here; real details load on first click.
      -->
      <div class="card-details" data-imdbid="${movie.imdbID}">
        <div class="card-details-inner">
          <p><strong>Plot:</strong> Click to load details…</p>
        </div>
      </div>
    `;

    // If the movie is already in the watchlist, mark the button
    if (isInWatchlist(movie.imdbID)) {
      card.querySelector(".btn-watchlist").classList.add("added");
    }

    // Append the card to the grid
    grid.appendChild(card);

    // --- FADE-IN ANIMATION ---
    // We use setTimeout with a small delay so the browser has painted
    // the card (at opacity 0) before we add .fade-in.
    // This makes the CSS transition actually run.
    // The "index * 80" staggers each card by 80ms for a cascading effect.
    setTimeout(function () {
      card.classList.add("fade-in");
    }, index * 80);
  });

  // --- ATTACH THE SINGLE CLICK LISTENER TO THE GRID ---
  // We use EVENT DELEGATION: one listener on the parent grid catches
  // clicks on any child element. We then figure out what was clicked.

  if (!grid.hasAttribute("data-listener-attached")) {
    grid.setAttribute("data-listener-attached", "true");

    grid.addEventListener("click", function (event) {
      // event.target is the exact element the user clicked on.
      // .closest() walks UP the DOM tree to find the nearest .movie-card.
      const card = event.target.closest(".movie-card");
      if (!card) return; // clicked outside any card — do nothing

      // --- Did the user click the "Add to Watchlist" button? ---
      const watchlistBtn = event.target.closest(".btn-watchlist");
      if (watchlistBtn) {
        // Stop the click from also toggling the details panel
        event.stopPropagation();

        const imdbID = watchlistBtn.getAttribute("data-imdbid");
        toggleWatchlist(imdbID, card);
        return; // done — don't open details
      }

      // --- Otherwise, the user clicked somewhere else on the card ---
      // Toggle the details panel open / closed
      const detailsPanel = card.querySelector(".card-details");
      const imdbID = card.getAttribute("data-imdbid");

      if (detailsPanel.classList.contains("open")) {
        // Panel is open → close it
        detailsPanel.classList.remove("open");
      } else {
        // Panel is closed → open it, and load full details if needed
        detailsPanel.classList.add("open");
        loadDetailedInfo(imdbID, detailsPanel);
      }
    });
  }
}


// LOADING DETAILED MOVIE INFO (Second API Call)
// ============================================================
// -- The search endpoint only returns basic info (title, year, poster).
//    To get plot, rating, and actors, we make a SECOND call using the
//    movie's IMDb ID. We only do this once per movie (cached after that).

async function loadDetailedInfo(imdbID, detailsPanel) {
  const inner = detailsPanel.querySelector(".card-details-inner");

  // If we already loaded details, don't fetch again
  if (detailsPanel.getAttribute("data-loaded") === "true") return;

  // Show a loading hint
  inner.innerHTML = "<p>Loading details…</p>";

  try {
    // -- The "i" parameter fetches by IMDb ID instead of searching by title
    const url = `${API_BASE}?apikey=${API_KEY}&i=${imdbID}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "True") {
      // Replace the placeholder with real data
      inner.innerHTML = `
        <p><strong>Plot:</strong> ${data.Plot || "Not available"}</p>
        <p><strong>Rating:</strong> ${data.imdbRating || "N/A"} / 10</p>
        <p><strong>Actors:</strong> ${data.Actors || "N/A"}</p>
        <p><strong>Genre:</strong> ${data.Genre || "N/A"}</p>
        <p><strong>Director:</strong> ${data.Director || "N/A"}</p>
      `;
    } else {
      inner.innerHTML = "<p>Details not available.</p>";
    }

    // Mark as loaded so we don't fetch again
    detailsPanel.setAttribute("data-loaded", "true");
  } catch (error) {
    inner.innerHTML = "<p>Could not load details. Check your connection.</p>";
    console.error("Error fetching detailed info:", error);
  }
}


// 11. WATCHLIST MANAGEMENT
// ============================================================

// --- Check if a movie is already in the watchlist ---
// Returns true or false
function isInWatchlist(imdbID) {
  // .find() returns the first matching item, or undefined if none match
  return (
    watchlist.find(function (movie) {
      return movie.imdbID === imdbID;
    }) !== undefined
  );
}

// --- Add or remove a movie from the watchlist ---
function toggleWatchlist(imdbID, card) {
  if (isInWatchlist(imdbID)) {
    // --- REMOVE from watchlist ---
    // .filter() creates a NEW array without the item that matches
    watchlist = watchlist.filter(function (movie) {
      return movie.imdbID !== imdbID;
    });

    // Update the button text and style on the search card
    const btn = card.querySelector(".btn-watchlist");
    btn.textContent = "⭐ Add to Watchlist";
    btn.classList.remove("added");
  } else {
    // --- ADD to watchlist ---
    // Grab the title and poster from the card's DOM
    const title = card.querySelector(".card-title").textContent;
    const poster = card.querySelector(".poster").src;

    // Push a new object onto the array
    watchlist.push({ imdbID: imdbID, title: title, poster: poster });

    // Update the button
    const btn = card.querySelector(".btn-watchlist");
    btn.textContent = "✓ Added";
    btn.classList.add("added");
  }

  // Re-render the watchlist section every time it changes
  renderWatchlist();
}


// RENDERING THE WATCHLIST

// -- Clears the watchlist grid and rebuilds it from the array.
//    Also updates the badge count and empty-state message.

function renderWatchlist() {
  // Re-grab the grid fresh every time so we always have the live element.
  const grid = document.getElementById("watchlistGrid");

  // Update the badge number
  watchlistBadge.textContent = watchlist.length;

  // If watchlist is empty, show the "empty" message and hide the grid
  if (watchlist.length === 0) {
    grid.innerHTML = "";
    watchlistEmpty.classList.remove("hidden");
    return; // nothing more to do
  }

  // Hide the "empty" message because we have items
  watchlistEmpty.classList.add("hidden");

  // Clear old cards
  grid.innerHTML = "";

  // Build a card for each movie in the watchlist array
  watchlist.forEach(function (movie, index) {
    const card = document.createElement("div");
    card.classList.add("watchlist-card");
    card.setAttribute("data-imdbid", movie.imdbID);

    card.innerHTML = `
      <img class="poster" src="${movie.poster}" alt="Poster for ${movie.title}" />
      <div class="wl-info">
        <h3 class="wl-title">${movie.title}</h3>
        <!-- The remove button carries the IMDb ID so we know which movie to remove -->
        <button class="btn-remove" data-imdbid="${movie.imdbID}">🗑 Remove</button>
      </div>
    `;

    grid.appendChild(card);

    // Staggered fade-in (same technique as search cards)
    setTimeout(function () {
      card.classList.add("fade-in");
    }, index * 60);
  });

  // --- Attach the single delegated click listener (only once) ---
  // The flag prevents stacking duplicate listeners across re-renders.
  if (!grid.hasAttribute("data-listener-attached")) {
    grid.setAttribute("data-listener-attached", "true");

    grid.addEventListener("click", function (event) {
      const removeBtn = event.target.closest(".btn-remove");
      if (!removeBtn) return; // clicked something else

      const imdbID = removeBtn.getAttribute("data-imdbid");

      // Remove from the array using .filter()
      // .filter() returns a NEW array that excludes the matching movie
      watchlist = watchlist.filter(function (movie) {
        return movie.imdbID !== imdbID;
      });

      // Also update the matching search card's button (if it's still visible)
      // We re-grab movieGrid here too, to be safe
      const searchGrid = document.getElementById("movieGrid");
      const searchCard = searchGrid.querySelector(
        `.movie-card[data-imdbid="${imdbID}"]`,
      );
      if (searchCard) {
        const btn = searchCard.querySelector(".btn-watchlist");
        btn.textContent = "⭐ Add to Watchlist";
        btn.classList.remove("added");
      }

      // Re-render the watchlist to reflect the change
      renderWatchlist();
    });
  }
}


// CLEAR SEARCH RESULTS
// -- Resets everything back to the initial state.

clearBtn.addEventListener("click", function () {
  searchInput.value = ""; // empty the input
  charCount.textContent = "0 characters"; // reset counter
  // Re-grab the grid fresh so we always hit the live element
  document.getElementById("movieGrid").innerHTML = "";
  showStatus("", false); // clear status text
  showClearBtn(false); // hide the clear button
});


// HELPER FUNCTIONS

// Show or hide the status message. Pass isError=true for red styling.
function showStatus(message, isError) {
  statusMessage.textContent = message;
  // Toggle the "error" class for red colouring
  if (isError) {
    statusMessage.classList.add("error");
  } else {
    statusMessage.classList.remove("error");
  }
}

// Show or hide the "Clear" button
function showClearBtn(visible) {
  if (visible) {
    clearBtn.classList.remove("hidden");
  } else {
    clearBtn.classList.add("hidden");
  }
}
