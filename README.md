# nextsong

We always play music in our classroom from a public Spotify playlist. Every now and then there's someone that doesn't like the current song. In order to solve that problem we are using a NodeMCU with a big red button.

Since recently Spotify has added new endpoints where you for example can make a request to [skip to the next song](https://developer.spotify.com/web-api/skip-users-playback-to-next-track/) in the current playlist, which is exactly what we need! Through a connection with all the other NodeMCU's in our classroom people can cast a vote to skip to the next song. If more than two people vote to skip, a request is send.

This is not the official repo (you can find that one [right here](https://github.com/dandevri/minor-wot)), but this is my repo where I am going to experiment with creating the whole API handling through a simple HTML button - which we can later convert/implement in the official app where the button handling is configured.

## What does it do?
- NodeJS & Express for server-side rendering
- Handlebars to handle the templating
- The Spotify API for modifying the playback state

## How to install the project?
- Download/clone the repo and run the `npm install` command

## Add this code to the spotify-web-api-node module which you can find at node_modules/spotify-web-api-node/src/spotify-web-api.js

```
/**
 * Get the current playing track from the user that has signed in (the current user).
 * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
 * @example getMe().then(...)
 * @returns {Promise|undefined} A promise that if successful, resolves to an object
 *          containing information about the user. The amount of information
 *          depends on the permissions given by the user. If the promise is
 *          rejected, it contains an error object. Not returned if a callback is given.
 */
currentlyPlaying: function(callback) {
  var request = WebApiRequest.builder()
    .withPath('/v1/me/player/currently-playing')
    .build();

  this._addAccessToken(request, this.getAccessToken());

  var promise = this._performRequest(HttpManager.get, request);

  if (callback) {
    promise.then(function(data) {
      callback(null, data);
    }, function(err) {
      callback(err);
    });
  } else {
    return promise;
  }
},

/**
 * Skip to the next track in user's que
 * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
 * @example getMe().then(...)
 * @returns {Promise|undefined} A promise that if successful, resolves to an object
 *          containing information about the user. The amount of information
 *          depends on the permissions given by the user. If the promise is
 *          rejected, it contains an error object. Not returned if a callback is given.
 */
nextTrack: function(callback) {
  var request = WebApiRequest.builder()
    .withPath('/v1/me/player/next')
    .build();

  this._addAccessToken(request, this.getAccessToken());

  var promise = this._performRequest(HttpManager.post, request);

  if (callback) {
    promise.then(function(data) {
      callback(null, data);
    }, function(err) {
      callback(err);
    });
  } else {
    return promise;
  }
},
```

## They yet have to add the new endpoints, so that's why you need to add them yourself.
I am currently working on creating a PR to the official repo.

## Run it.

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
