# JMU CS343 P3 SP23
## David Clark
This project uses two APIs:
1) https://rapidapi.com/accujazz/api/rawg-video-games-database
2) https://rapidapi.com/h0p3rwe/api/youtube-search-and-download
 
Process:
- User types in Game title in Search Bar, Video Game Data Database returns result (information about game)
- Button appears below information that says 'get OST'
- When user clicks this button, YouTube searcher will search for a playlist (takes title, and adds 'OST')
- Returns results below

# TODO:
- When the search button is pressed, clear the previous search results
- Update the HTML on the website to include information about the APIs (write up)
- Write a report.html file (similar to P1)
- The program shouldn't ONLY do one game. It should pull many related games
    - For example, if you type in 'spec ops' it should pull games with 'spec ops' in the title
    - Have a list of buttons and then pull information about the game and trailers and stuff.
