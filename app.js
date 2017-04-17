var express = require('express');
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var exphbs = require ('express-handlebars');
var request = require ('request');
var bodyParser = require ('body-parser');
var dotenv = require ('dotenv').config();

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser())
   .use(require('body-parser').urlencoded({extended: true}));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/current', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  var scope = 'user-read-currently-playing';
  var options = {
    url:"https://api.spotify.com/v1/me/player/currently-playing",
    headers:{
      'Authorization': "Bearer " + 'BQCeCBmzv8Sy29aRIHC6pkNFPMdo4zPfFXD9TKCLSsmvGnbDkGYJE821UBcKc9Vq9EaVsYReKMYGR2B1HGaHA0c0tcIC0ar0KhLTDbSFrAPf9cKoJNtmMu7MicofSad5L_tAU0NvocZmtKsBJygGrQJ-QCHojf4sgtw31FGr6-xUFYgeLnGsN3XWtWrmO13OQM_Rg_d28jti2nxYTBcXNcw',
      'response_type': 'code',
      'client_id': client_id,
      'scope': scope,
      'state': state
    },
    json:true
  };
  request.get(options, function(error, req, body){
    console.log(body);
    res.render('current', {data : body});
  });
});

app.get('/next', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  var scope = 'user-modify-playback-state';
  var options = {
    url:"https://api.spotify.com/v1/me/player/next",
    headers:{
      'Authorization': "Bearer " + 'BQBNqXFjjYnWqHhvEWVWN6KISGCJsm2lsVm-Jqo8yCe_unOCCfWaHqBVYxJa5MQbcVgrbf2GirPqIVn2D4G7eqRDxUe6QZuXyd25zOed-5MymgFoATQk7nTqrQPmqBUDwT4oghiAeI9A1hzElSh7RJaF_huwc2oqDeNIuKw-sBe1Gu36jE0Q2mQYGaXwomQkd1GmbMqnrgKKObHw22HxaE21TQ',
      'response_type': 'code',
      'client_id': client_id,
      'scope': scope,
      'state': state
    },
    json:true
  };
  request.post(options, function(error, req, body){
    console.log(body);
    res.render('next');
  });
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);
