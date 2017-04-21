# nextsong

We always play music from a public Spotify playlist in our classroom. Every now and then there's someone who doesn't like the current song. In order to solve that problem we are using a NodeMCU with a big red button.

Since recently Spotify has added new endpoints where you can [modify the playback state](https://developer.spotify.com/web-api/web-api-connect-endpoint-reference/), which is exactly what we need! Through a connection with all the other NodeMCU's in our classroom people can cast a vote to skip to the next song. If more than two people vote to skip, a request is send.

This is not the official repo (you can find that one [over here](https://github.com/dandevri/minor-wot)), but this is my repo where I am going to experiment with creating the whole API handling through simple HTML buttons - which we can later convert/implement in the official app.

## What does it do?
- NodeJS & Express for server-side rendering
- Handlebars to handle the templating
- The Spotify API for modifying the playback state

## How to install the project?
- Download/clone the repo and run the `npm install` command

## Add extra code...
...to the spotify-web-api-node module which you can find at node_modules/spotify-web-api-node/src/spotify-web-api.js

```
/**
 * Get the object currently being played on the user's Spotify account.
 * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
 * @example getUsersCurrentlyPlayingTrack().then(...)
 * @returns {Promise|undefined} A promise that if successful, resolves to an object
 *          containing information about the user. The amount of information
 *          depends on the permissions given by the user. If the promise is
 *          rejected, it contains an error object. Not returned if a callback is given.
 */
getUsersCurrentlyPlayingTrack: function(market, callback) {
  var request = WebApiRequest.builder()
    .withPath('/v1/me/player/currently-playing')
    .withQueryParameters({
      'market' : market
    })
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
 * Skips to next track in user's queue.
 * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
 * @example nextUsersTrack().then(...)
 * @returns {Promise|undefined} A promise that if successful, resolves to an object
 *          containing information about the user. The amount of information
 *          depends on the permissions given by the user. If the promise is
 *          rejected, it contains an error object. Not returned if a callback is given.
 */
nextUsersTrack: function(deviceId, callback) {
  var request = WebApiRequest.builder()
    .withPath('/v1/me/player/next')
    .withQueryParameters({
      'device_id' : deviceId
    })
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

/**
 * Skips to previous track in the user's queue.
 * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
 * @example previousUsersTrack().then(...)
 * @returns {Promise|undefined} A promise that if successful, resolves to an object
 *          containing information about the user. The amount of information
 *          depends on the permissions given by the user. If the promise is
 *          rejected, it contains an error object. Not returned if a callback is given.
 */
previousUsersTrack: function(deviceId, callback) {
  var request = WebApiRequest.builder()
    .withPath('/v1/me/player/previous')
    .withQueryParameters({
      'device_id' : deviceId
    })
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

/**
 * Pause playback on the user's account.
 * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
 * @example pauseUsersPlayback().then(...)
 * @returns {Promise|undefined} A promise that if successful, resolves to an object
 *          containing information about the user. The amount of information
 *          depends on the permissions given by the user. If the promise is
 *          rejected, it contains an error object. Not returned if a callback is given.
 */
pauseUsersPlayback: function(deviceId, callback) {
  var request = WebApiRequest.builder()
    .withPath('/v1/me/player/pause')
    .withQueryParameters({
      'device_id' : deviceId
    })
    .build();

  this._addAccessToken(request, this.getAccessToken());

  var promise = this._performRequest(HttpManager.put, request);

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
 * Start a new context or resume current playback on the user's active device.
 * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
 * @example startUsersPlayback().then(...)
 * @returns {Promise|undefined} A promise that if successful, resolves to an object
 *          containing information about the user. The amount of information
 *          depends on the permissions given by the user. If the promise is
 *          rejected, it contains an error object. Not returned if a callback is given.
 */
startUsersPlayback: function(deviceId, callback) {
  var request = WebApiRequest.builder()
    .withPath('/v1/me/player/play')
    .withQueryParameters({
      'device_id' : deviceId
    })
    .build();

  this._addAccessToken(request, this.getAccessToken());

  var promise = this._performRequest(HttpManager.put, request);

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
They yet have to add the new endpoints, so that's why you need to add them yourself if you want to get this working.

## Run it.

- Run the `npm start` command to start the server
- Go to your [localhost](http://localhost:8888)
- Voila

## API KEY
If you want to test the app you can get your own key [right here](https://developer.spotify.com/my-applications/#!/applications).

## TO-DO
- Refactor code to ES5 (make it my own)

## Code resource
https://github.com/spotify/web-api-auth-examples/pull/7

## License
MIT
