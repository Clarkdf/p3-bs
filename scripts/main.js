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

  const rhymeResultsPromise = getRhymes(queryText);
  rhymeResultsPromise.then((rhymeResults) => {
    const rhymeListItemsArray = rhymeResults.map(rhymObj2DOMObj);
    console.log("rhymeListItemsArray", rhymeListItemsArray);
    const rhymeResultsUL = document.getElementById("rhyme-results");
    rhymeListItemsArray.forEach((rhymeLi) => {
      rhymeResultsUL.appendChild(rhymeLi);
    });
  });

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