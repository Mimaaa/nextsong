var Spotify = require('spotify-web-api-node');
var express = require('express');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var exphbs = require ('express-handlebars');
var request = require ('request');
var bodyParser = require ('body-parser');
var dotenv = require ('dotenv').config();

var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var REDIRECT_URI = process.env.REDIRECT_URI;
var STATE_KEY = 'spotify_auth_state';

var scopes = ['user-read-currently-playing', 'user-modify-playback-state'];

var spotifyApi = new Spotify({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI
});

var generateRandomString = function (N) {
  return (Math.random().toString(36)+Array(N).join('0')).slice(2, N+2);
};

var app = express();
app.use(express.static(__dirname + '/public'))
   .use(cookieParser())
   .use(require('body-parser').urlencoded({extended: true}))
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

function home (req, res) {
  res.render('home');
}

function login (_, res) {
  var state = generateRandomString(16);
  res.cookie(STATE_KEY, state);
  res.redirect(spotifyApi.createAuthorizeURL(scopes, state));
}

function callback (req, res) {
  const { code, state } = req.query;
  var storedState = req.cookies ? req.cookies[STATE_KEY] : null;

  // first do state validation
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  // if the state is valid, get the authorization code and pass it on to the client
  } else {
    res.clearCookie(STATE_KEY);
    // Retrieve an access token and a refresh token
    spotifyApi.authorizationCodeGrant(code).then(data => {
      const { expires_in, access_token, refresh_token } = data.body;

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      // we can also pass the token to the browser to make requests from there
      res.redirect('/current/#' +
        querystring.stringify({
          access_token: access_token,
          refresh_token: refresh_token
        }));
    }).catch(err => {
      res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
    });
  }
}

function currentlyPlaying (req, res) {
   spotifyApi.getUsersCurrentlyPlayingTrack().then(({ body }) => {
     console.log(body);
     res.render('current', { data : body});
   });
 }

function startCurrentTrack (req, res) {
  spotifyApi.startUsersPlayback().then(({ body }) => {
    console.log(body);
    res.redirect('/current');
  });
}

function pauseCurrentTrack (req, res) {
  spotifyApi.pauseUsersPlayback().then(({ body }) => {
    console.log(body);
    res.redirect('/current');
  });
}

function skipToNextTrack (req, res) {
  spotifyApi.nextUsersTrack().then(({ body }) => {
    console.log(body);
    res.redirect('/current');
  });
}

function skipToPreviousTrack (req, res) {
  spotifyApi.previousUsersTrack().then(({ body }) => {
    console.log(body);
    res.redirect('/current');
  });
}

 // requesting access token from refresh token
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

console.log('Listening on 8888');
app.listen(8888);
