# nextsong

We always play music in our classroom from a public Spotify playlist. Every now and then there's someone that doesn't like the current song. In order to solve that problem we are using a NodeMCU with a big red button.

Since recently Spotify has added new endpoints where you for example can make a request to [skip to the next song](https://developer.spotify.com/web-api/skip-users-playback-to-next-track/) in the current playlist, which is exactly what we need!

This is not the official repo (you can find that one [right here](https://github.com/dandevri/minor-wot)), but this is my repo where I am going to experiment with creating the whole API handling through a simple HTML button - which we can later convert/implement in the official app where the button handling is configured.

## What does it do?
- NodeJS & Express for server-side rendering
- Handlebars to handle the templating
- The Spotify API for modifying the playback state

## How to install the project?
- Download/clone the repo and run the `npm install` command
- Run the `npm start` command to start the server
- Go to your [localhost](http://localhost:8888)
- Voila

## API KEY
If you want to test the app you can get your own key [right here](https://developer.spotify.com/my-applications/#!/applications).

## TO-DO
- Add more endpoints
- Refactor code

## Code resource
https://github.com/spotify/web-api-auth-examples/pull/7

## License
MIT
