# chai aur backend series

- always wrap try catch to handle database
- database is always in another continent so it takes time so use async await

- async operation always return a promise so when we called connentDb() we can write try catch.

- app.listen to continously listen our server that it will open

# Refresh Token Logic

# access token short lived, refresh token are longed lived

refresh token store in db when access token timeup send a 401 --> request if 401 request come then hit a specific endPoint and refresh the access token ---> also send refresh token with the request so that we can match it then start a new session



