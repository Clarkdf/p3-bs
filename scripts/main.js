
/** TODO: Add it so that it clears the GameResults div in index when search is submitted */
const searchForm = document.getElementById("top-search");
searchForm.onsubmit = (ev) => {
  console.log("submitted top-search with", ev);
  ev.preventDefault();
  // https://stackoverflow.com/a/26892365/1449799
  const formData = new FormData(ev.target);
  // console.log(formData)
  // for (const pair of formData.entries()) {
  //   console.log(`${pair[0]}, ${pair[1]}`);
  // }
  const queryText = formData.get("query");
  console.log("queryText", queryText);


  // Dr. Stewart's Example code
  /*const rhymeResultsPromise = getRhymes(queryText);
  rhymeResultsPromise.then((rhymeResults) => {
    const rhymeListItemsArray = rhymeResults.map(rhymObj2DOMObj);
    console.log("rhymeListItemsArray", rhymeListItemsArray);
    const rhymeResultsUL = document.getElementById("rhyme-results");
    rhymeListItemsArray.forEach((rhymeLi) => {
      rhymeResultsUL.appendChild(rhymeLi);
    });
  }); */
  const gameResultsPromise = getGame(queryText);
  gameResultsPromise.then((gameResults) => {
    gameObjDom(gameResults);
    return gameResults.name; // Return title for OST Ssearch
  }).then((gameTitle) => {
    return searchYouTubePlaylists(gameTitle);
  }).then((playlists) => {
    playlistObjDom(playlists.contents[0]) // We're only interested in the first playlist result for this project
  })
};

// given a word (string), search for rhymes
// https://rhymebrain.com/api.html#rhyme
//  https://rhymebrain.com/talk?function=getRhymes&word=hello

const getRhymes = (word) => {

  console.log("attempting to get rhymes for", word);
  return fetch(
    `https://rhymebrain.com/talk?function=getRhymes&word=${word}`
  ).then((resp) => resp.json());
};

const rhymObj2DOMObj = (rhymeObj) => {
  //this should be an array where each element has a structure like
  //
  // "word": "no",
  // "frequency": 28,
  // "score": "300",
  // "flags": "bc",
  // "syllables": "1"
  const rhymeListItem = document.createElement("li");
  const rhymeButton = document.createElement("button");
  rhymeButton.classList.add('btn')
  rhymeButton.classList.add('btn-info')
  rhymeButton.textContent = rhymeObj.word;
  rhymeButton.onclick = searchForBook;
  rhymeListItem.appendChild(rhymeButton);
  return rhymeListItem;
};

const searchForBook = (ev) => {
  const word = ev.target.textContent;
  console.log("search for", word);
  return fetch(`https://gutendex.com/books/?search=${word}`).then((r) =>
    r.json()
  ).then((bookResultsObj) => {
    // console.log(bookResultsObj.hasOwnProperty('results'))
    const bookCardsArray = bookResultsObj.results.map(bookObj2DOMObj)
    console.log("bookCardsArray", bookCardsArray);
    const bookResultsElem = document.getElementById("book-results");
    bookCardsArray.forEach(book => bookResultsElem.appendChild(book))
  })
};

const bookObj2DOMObj = (bookObj) => {
  // {"id":70252,"title":"Threads gathered up : $b A sequel to \"Virgie's Inheritance\"","authors":[{"name":"Sheldon, Georgie, Mrs.","birth_year":1843,"death_year":1926}],"translators":[],"subjects":["American fiction -- 19th century"],"bookshelves":[],"languages":["en"],"copyright":false,"media_type":"Text","formats":{"image/jpeg":"https://www.gutenberg.org/cache/epub/70252/pg70252.cover.medium.jpg","application/rdf+xml":"https://www.gutenberg.org/ebooks/70252.rdf","text/plain":"https://www.gutenberg.org/ebooks/70252.txt.utf-8","application/x-mobipocket-ebook":"https://www.gutenberg.org/ebooks/70252.kf8.images","application/epub+zip":"https://www.gutenberg.org/ebooks/70252.epub3.images","text/html":"https://www.gutenberg.org/ebooks/70252.html.images","application/octet-stream":"https://www.gutenberg.org/files/70252/70252-0.zip","text/plain; charset=us-ascii":"https://www.gutenberg.org/files/70252/70252-0.txt"},"download_count":745},

  // make a dom element
  // add bookObj.title to the element
  // return element

  const bookCardDiv = document.createElement("div");
  bookCardDiv.classList.add("card");

  const bookCardBody = document.createElement("div");
  bookCardBody.classList.add("card-body");

  const titleElem = document.createElement("h5");
  titleElem.textContent = bookObj.title;
  bookCardBody.appendChild(titleElem);
  const cardText = document.createElement("p");
  cardText.textContent =
    "Some quick example text to build on the card title and make up the bulk of the card's content.";
  bookCardBody.appendChild(cardText);
  if (bookObj?.formats?.["image/jpeg"]) {
    const bookCardImg = document.createElement("img");
    bookCardImg.classList.add("card-img-top");
    bookCardImg.src = bookObj?.formats?.["image/jpeg"];
    bookCardBody.appendChild(bookCardImg)
  }
  if (bookObj?.formats?.["text/plain"]) {
    const bookTextLink = document.createElement("a");
    bookTextLink.href = bookObj?.formats?.["text/plain"];
    bookTextLink.classList.add("btn");
    bookTextLink.classList.add("btn-primary");
    bookTextLink.textContent = "Read It!";
    bookCardBody.appendChild(bookTextLink);
  }
  bookCardDiv.appendChild(bookCardBody)
  return bookCardDiv

};


/** Video Game APIS (This is where the fun begins)
 * 1) https://rapidapi.com/accujazz/api/rawg-video-games-database (special dev key = 0b81130b95524eb6bb292ae0911635a8)
 * 2) https://rapidapi.com/h0p3rwe/api/youtube-search-and-download
 * 
 * Process:
 * - User types in Game title in Search Bar, Video Game Data Database returns result (information about game)
 * - Button appears below information that says 'get OST'
 * - When user clicks this button, YouTube searcher will search for a playlist (takes title, and adds 'OST')
 * - Returns results below
 */


// Method connects to the RawG game Database and returns the game if it can find one.
// Throws an error if it cannot
// TODO: Add support for redirection
const getGame = (game) => {
  game = game.replaceAll(' ', '-'); // Replace all spaces with '-' for searching Database
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
  releaseDate.innerText = "Release Data: " + gameData.released;
  gameDiv.appendChild(releaseDate);

  // Add Metacritic Score:
  const score = document.createElement('p');
  score.innerText = "Metacritic Score: " + gameData.metacritic;
  gameDiv.appendChild(score);

  // Inject division into dom (HTML)
  const loc = document.getElementById('game-results');
  loc.appendChild(gameDiv);
};

// Uses YouTube Search API, returns a long list of playlists 
// Adds ' OST' to the provided game title
const searchYouTubePlaylists = (gameTitle) => {

  const url = `https://youtube-search-and-download.p.rapidapi.com/search?query=${gameTitle}%OST&hl=en&gl=US&type=p&sort=r`;
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

  // Create iframe (for YouTUbe)
  const iframe = document.createElement('iframe');
  iframe.width = "420";
  iframe.height = "315";
  // Find the SRC
  iframe.src = `https://www.youtube.com/embed/?listType=playlist&list=${playlist.playlist.playlistId}`
  playListDiv.appendChild(iframe);

  // Inject division into dom (HTML)
  const loc = document.getElementById('playlist-results');
  loc.appendChild(playListDiv);  
}