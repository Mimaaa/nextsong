// Set dependencies
var Spotify = require('spotify-web-api-node');
var express = require('express');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var exphbs = require ('express-handlebars');
var dotenv = require ('dotenv').config();

// Set Spotify oAuth credentials and state_key
var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var REDIRECT_URI = process.env.REDIRECT_URI;
var PORT = process.env.PORT || 8888;
var STATE_KEY = 'spotify_auth_state';

// Define scopes for API endpoint data
var scopes = ['user-read-currently-playing', 'user-modify-playback-state'];

// Call the spotify-web-api-node package and set credentials
var spotifyApi = new Spotify({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI
});

var generateRandomString = function (N) {
  return (Math.random().toString(36)+Array(N).join('0')).slice(2, N+2);
};

// Set express app and add all functions
var app = express();
app.use(express.static(__dirname + '/public'))
   .use(cookieParser())
   .engine('handlebars', exphbs({defaultLayout: 'main'}))
   .set('view engine', 'handlebars')
   .get('/', home)
   .get('/login', login)
   .get('/callback', callback)
   .get('/current', currentlyPlaying)
   .post('/play', startCurrentTrack)
   .post('/pause', pauseCurrentTrack)
   .post('/next', skipToNextTrack)
   .post('/previous', skipToPreviousTrack)
   .get('/refresh-token', refreshToken);

// Get home view
function home (req, res) {
  res.render('home');
}

function login (_, res) {
  // Generate a random state key
  var state = generateRandomString(16);
  // Set HTTP header with the STATE_KEY and generated random string
  res.cookie(STATE_KEY, state);
  // Create authorize url with the scopes and state
  res.redirect(spotifyApi.createAuthorizeURL(scopes, state));
}

function callback (req, res) {
  const { code, state } = req.query;
  var storedState = req.cookies ? req.cookies[STATE_KEY] : null;

  // First do state validation
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));

  // If the state is valid, get the authorization code and pass it on to the client
  } else {
    // Clear the cookie that was set
    res.clearCookie(STATE_KEY);
    // Retrieve an access token and a refresh token
    spotifyApi.authorizationCodeGrant(code).then(data => {
      const { expires_in, access_token, refresh_token } = data.body;

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      // Redirect to current page
      res.redirect('/current');
    });
  }
}

function currentlyPlaying (req, res) {
   spotifyApi.getUsersCurrentlyPlayingTrack().then(({ body }) => {
     // Render the data to the current view
     res.render('current', { data : body});
   });
 }

function startCurrentTrack (req, res) {
  spotifyApi.startUsersPlayback().then(({ body }) => {
    res.redirect('/current');
  });
}

function pauseCurrentTrack (req, res) {
  spotifyApi.pauseUsersPlayback().then(({ body }) => {
    res.redirect('/current');
  });
}

function skipToNextTrack (req, res) {
  spotifyApi.nextUsersTrack().then(({ body }) => {
    res.redirect('/current');
  });
}

function skipToPreviousTrack (req, res) {
  spotifyApi.previousUsersTrack().then(({ body }) => {
    res.redirect('/current');
  });
}

 // Requesting access token from refresh token
function refreshToken (req, res) {
  const { refresh_token } = req.query;
  if (refresh_token) {
    spotifyApi.setRefreshToken(refresh_token);
  }
  spotifyApi.refreshAccessToken().then(({body}) =>  {
    res.send({
      'access_token': body.access_token
    })
  }).catch(err => {
    console.log('Could not refresh access token', err);
  });
}

console.log('AWAKEN');
app.listen(PORT);
