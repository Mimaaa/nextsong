const Spotify = require('spotify-web-api-node');
const express = require('express');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

const exphbs = require ('express-handlebars');
const request = require ('request');
const bodyParser = require ('body-parser');
const dotenv = require ('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const STATE_KEY = 'spotify_auth_state';

//Define scopes to the endpoints
const scopes = ['user-read-private', 'user-read-email', 'user-read-currently-playing', 'user-modify-playback-state'];

const spotifyApi = new Spotify({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI
});

const generateRandomString = N => (Math.random().toString(36)+Array(N).join('0')).slice(2, N+2);

var app = express();
app.use(express.static(__dirname + '/public'))
   .use(cookieParser())
   .use(require('body-parser').urlencoded({extended: true}));

//Set view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/login', (_, res) => {
  const state = generateRandomString(16);
  res.cookie(STATE_KEY, state);
  res.redirect(spotifyApi.createAuthorizeURL(scopes, state));
});

/**
 * The /callback endpoint - hit after the user logs in to spotifyApi
 * Verify that the state we put in the cookie matches the state in the query
 * parameter. Then, if all is good, redirect the user to the user page. If all
 * is not good, redirect the user to an error page
 */
 app.get('/callback', (req, res) => {
   const { code, state } = req.query;
   const storedState = req.cookies ? req.cookies[STATE_KEY] : null;

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

       // use the access token to access the Spotify Web API
       spotifyApi.getMe().then(({ body }) => {
         console.log(body);
       });

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
 });

//set current route, request currently played song and render data to current view
 app.get('/current', function (req, res) {
   spotifyApi.currentlyPlaying().then(({ body }) => {
     console.log(body);
     res.render('current', { data : body});
   });
 });

//set next route, request next song and redirect to current route
 app.post('/next', function (req, res) {
   spotifyApi.nextTrack().then(({ body }) => {
     console.log(body);
     res.redirect('/current');
   });
 });

 //set next route, request next song and redirect to current route
  app.post('/pause', function (req, res) {
    spotifyApi.pauseTrack().then(({ body }) => {
      console.log(body);
      res.redirect('/current');
    });
  });

  //set next route, request next song and redirect to current route
   app.post('/play', function (req, res) {
     spotifyApi.playTrack().then(({ body }) => {
       console.log(body);
       res.redirect('/current');
     });
   });

 //set previous route, request previous song and redirect to current route
  app.post('/previous', function (req, res) {
    spotifyApi.previousTrack().then(({ body }) => {
      console.log(body);
      res.redirect('/current');
    });
  });

 // requesting access token from refresh token
app.get('/refresh_token', (req, res) => {
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
});

console.log('Listening on 8888');
app.listen(8888);
