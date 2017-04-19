# Skip to the next track with the Spotify API

We are using a NodeMCU with a big red button to create a interactive WoT solution.

## The Idea

We are always playing music through the speakers in our classroom from a public Spotify playlist. Every now and then there's someone that doesn't like the current song. In order to solve that problem we are using the NodeMCU that we got for the Web of Things course to make a polling system where people can vote to skip to the next song.

Since recently Spotify has added a new endpoint where you can make a request to [skip to the next song](https://developer.spotify.com/web-api/skip-users-playback-to-next-track/) in the current playlist, which is exactly what we need!

This is not the official repo (you can find that one [right here](https://github.com/dandevri/minor-wot)), but this is my repo where I am going to experiment with creating the whole API handling through a simple HTML button - which we can later convert/implement in the official app where the button handling is configured.

## Code resource

https://github.com/spotify/web-api-auth-examples/pull/7
