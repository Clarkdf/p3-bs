const searchForm = document.getElementById("top-search");
searchForm.onsubmit = (ev) => {
  console.log("submitted top-search with", ev);
  ev.preventDefault();

  // clear old Data if applicable.
  clearPastData();

  // https://stackoverflow.com/a/26892365/1449799
  const formData = new FormData(ev.target);
  const queryText = formData.get("query");
  console.log("queryText", queryText);

  searchGames(queryText).then((gameList) => {
    console.log(gameList);
    gameSearchButtonDom(gameList.results);
  });
};

/**
 * FUNCTIONS FOR CLEARING USER GENERATED DATA
 * FROM THE DOM*/

// clears all user-generated data from the dom
function clearPastData() {
  // Clears EVERYTHING
  clearButtons();
  clearGameData();
  clearPlaylist();
}


// Clears BUttons from the Dom
function clearButtons() {
  // Clear old buttons
  const buttonDiv = document.getElementById('game-buttons');
  buttonDiv.innerHTML = '';
  buttonDiv.innerText = '';
}

// Clears game data from Dom
function clearGameData() {
  // Clear old gameData
  const gameDataDiv = document.getElementById('game-results');
  gameDataDiv.innerHTML = '';
  gameDataDiv.innerText = '';
}

// Clears Playlist from Dom
function clearPlaylist() {
  // Clear youTube playList
  const playlistDiv = document.getElementById('playlist-results');
  playlistDiv.innerHTML = '';
  playlistDiv.innerText = '';
}

/** 
 * API FUNCTIONS
 * My APIs:
 * 1) https://rapidapi.com/accujazz/api/rawg-video-games-database (special dev key = 0b81130b95524eb6bb292ae0911635a8)
 * 2) https://rapidapi.com/h0p3rwe/api/youtube-search-and-download
 * 
 * Process:
 * - User types in Game title in Search Bar
 * - Pulls video games from database filters them based off that title
 * - Buttons appears showing the search results
 * - User picks game (presses button) 
 * - YouTube searcher will search for a playlist (takes title, and adds 'OST')
 * - Shows first playlist result
 */

// Pull all games from the RAWG database
const searchGames = (searchQuery) => {
  console.log('pulling games from the RAWG database');

  searchQuery = searchQuery.replaceAll(' ', '-'); // Replace all spaces with '-' for searching Database
  searchQuery = searchQuery.replaceAll('&', '-');

  console.log(searchQuery);

  const urlTest = `https://rawg-video-games-database.p.rapidapi.com/games?key=0b81130b95524eb6bb292ae0911635a8&search=${searchQuery}&search_exact=true&search-precise=true&page_size=25&exclude_stores=9`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '4b768059f4msh6f4e170a96ea2dbp162218jsnf21f16eb3364',
      'X-RapidAPI-Host': 'rawg-video-games-database.p.rapidapi.com'
    },
  };
  return fetch(urlTest, options).then((resp) => resp.json());
};

// Puts search results on buttons and adds button functionality.
const gameSearchButtonDom = (gameArray) => {

  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'button-div'

  let index = 0;
  for (index = 0; index < gameArray.length; index++) {
    let game = gameArray[index];
    // console.log(game);
    const button = document.createElement('button');
    button.innerText = game.name;
    button.onclick = (ev) => {
      getGame(game.slug).then((gameResult) => {
        // First clear old data (if present)
        clearGameData();
        clearPlaylist();
        // Then display new gameData and new results
        gameObjDom(gameResult);
        return searchYouTubePlaylists(gameResult);
      }).then((playListSearchResults) => {
        console.log(playListSearchResults);
        playlistObjDom(playListSearchResults.contents[0]); // We're only interested in the first result
      });
      ev.preventDefault();
    }
    buttonDiv.appendChild(button);
  }

  const location = document.getElementById('game-buttons');
  location.appendChild(buttonDiv);
}


// Method connects to the RawG game Database and returns the game if it can find one.
// Throws an error if it cannot 
const getGame = (game) => {
  console.log(game);
  console.log("Searching database for", game);

  /* Code taken from example provided by API (slightly modified) */
  const url = `https://rawg-video-games-database.p.rapidapi.com/games/${game}?key=0b81130b95524eb6bb292ae0911635a8`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '4b768059f4msh6f4e170a96ea2dbp162218jsnf21f16eb3364',
      'X-RapidAPI-Host': 'rawg-video-games-database.p.rapidapi.com'
    }
  };

  try {
    return fetch(url, options)
      .then((resp) => resp.json());
  } catch (error) {
    console.error(error);
  }
};


// Method constructs and inserts a dom object for displaying gameData taken from the database.

const gameObjDom = (gameData) => {
  console.log(gameData);

  const gameDiv = document.createElement('div'); // Main game division

  // Add the main header to the division (game title)
  const gameTitleHeader = document.createElement('h1')
  gameTitleHeader.innerText = gameData.name_original;
  gameDiv.appendChild(gameTitleHeader)

  // Add image to division
  // Note: Database does NOT provide box art for any games (or even art for ALL games)
  // This is a promotional image
  const figure = document.createElement('figure');
  const image = document.createElement('img');
  image.src = gameData.background_image;
  figure.appendChild(image);
  gameDiv.appendChild(figure);

  // Add the description to the division
  const descriptionP = document.createElement('p');
  descriptionP.innerText = gameData.description_raw;
  gameDiv.appendChild(descriptionP);

  // Add a list of available platforms:
  const platFormList = document.createElement('ul');
  const platforms = gameData.platforms;
  platforms.forEach((element) => {
    const listItem = document.createElement('li');
    listItem.innerText = element.platform.name;
    platFormList.appendChild(listItem);
  });
  gameDiv.appendChild(platFormList);

  // Add release Data:
  const releaseDate = document.createElement('p');
  releaseDate.innerText = "Release Date: " + gameData.released;
  gameDiv.appendChild(releaseDate);

  // Add Metacritic Score:
  const metaScore = document.createElement('p');
  metaScore.innerText = "Metacritic Score: " + gameData.metacritic;
  gameDiv.appendChild(metaScore);

  // Add UserScore
  const userScore = document.createElement('p');
  userScore.innerText = "User Score: " + gameData.rating;
  gameDiv.appendChild(userScore);

  // Inject division into dom (HTML)
  const loc = document.getElementById('game-results');
  loc.appendChild(gameDiv);
};

// Uses YouTube Search API, returns a long list of playlists 
// Adds ' OST' to the provided game title
const searchYouTubePlaylists = (gameData) => {

  const searchQuery = gameData.name_original + " OST"
  console.log(searchQuery)
  const url = `https://youtube-search-and-download.p.rapidapi.com/search?query=${searchQuery}&hl=en&gl=US&type=p&sort=r`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '4b768059f4msh6f4e170a96ea2dbp162218jsnf21f16eb3364',
      'X-RapidAPI-Host': 'youtube-search-and-download.p.rapidapi.com'
    }
  };

  try {
    return fetch(url, options)
      .then((resp) => resp.json());
  } catch (error) {
    console.error(error);
  }
};

const playlistObjDom = (playlist) => {
  console.log(playlist);

  // Create playlist div object
  const playListDiv = document.createElement('div'); // create the primary-div

  // Create iframe (for YouTube)
  const iframe = document.createElement('iframe');
  iframe.width = "420";
  iframe.height = "315";
  // Find the SRC
  iframe.src = `https://www.youtube.com/embed/?listType=playlist&list=${playlist.playlist.playlistId}`
  playListDiv.appendChild(iframe);

  // Inject division into dom (HTML)
  const loc = document.getElementById('playlist-results');
  loc.appendChild(playListDiv);
};