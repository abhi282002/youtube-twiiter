# chai aur backend series

- always wrap try catch to handle database
- database is always in another continent so it takes time so use async await

- async operation always return a promise so when we called connentDb() we can write try catch.

- app.listen to continously listen our server that it will open

# Refresh Token Logic

# access token short lived, refresh token are longed lived

refresh token store in db when access token timeup send a 401 --> request if 401 request come then hit a specific endPoint and refresh the access token ---> also send refresh token with the request so that we can match it then start a new session

$size : use to count the number of document

# User Video Model

# watch History is array which store user id

{
"statusCode": 200,
"data": {
"data": [
{
"\_id": "65a537b0ed09abd7ff1921fc",
"subscriber": [
{
"\_id": "65a52753cfc211c7331cce83",
"username": "neha123",
"email": "neha@gmail.com",
"fullName": "Abhishek Sharma",
"avatar": "http://res.cloudinary.com/di1anrzjp/image/upload/v1705322323/uobju0xsgjgudcsvdjal.png",
"coverImage": "http://res.cloudinary.com/di1anrzjp/image/upload/v1705322324/lki050h3tpopwroccjis.png",
"watchHistory": [],
"password": "$2b$10$kmnVgzNl2Hcqn4xV0hDgO.GoiwHnCUxEvkXBsoUvCDp3WL8a274MC",
"createdAt": "2024-01-15T12:38:43.726Z",
"updatedAt": "2024-01-15T13:47:40.398Z",
"**v": 0,
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWE1Mjc1M2NmYzIxMWM3MzMxY2NlODMiLCJpYXQiOjE3MDUzMjY0NjAsImV4cCI6MTcwNjE5MDQ2MH0.YaanMXCQjL2rgH91wMt3tP2cvyCt6eMq4YKFveILKs4",
"subscribedToSubscriber": []
}
],
"channel": "65a52781cfc211c7331cce8b",
"**v": 0
},
{
"\_id": "65a537f2ed09abd7ff192204",
"subscriber": [
{
"\_id": "65a52724cfc211c7331cce7b",
"username": "anu123",
"email": "anur@gmail.com",
"fullName": "Abhishek Sharma",
"avatar": "http://res.cloudinary.com/di1anrzjp/image/upload/v1705322276/cdskzdddwkkxfpl3uvqr.png",
"coverImage": "http://res.cloudinary.com/di1anrzjp/image/upload/v1705322277/yltokxkn3cv8afjjjph2.png",
"watchHistory": [],
"password": "$2b$10$Q4hGhb5DLCeZYb3S0YduW./t4qNCpGCQVKQDS8wOiWeLPnuqpsZW.",
"createdAt": "2024-01-15T12:37:56.953Z",
"updatedAt": "2024-01-15T13:49:28.531Z",
"**v": 0,
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWE1MjcyNGNmYzIxMWM3MzMxY2NlN2IiLCJpYXQiOjE3MDUzMjY1NjgsImV4cCI6MTcwNjE5MDU2OH0.os7zHXsTcH8axv_HKdR3nxZ-xT9bacNxmztJk9xgQII",
"subscribedToSubscriber": [
{
"\_id": "65a534cced09abd7ff1921f0",
"subscriber": "65a52781cfc211c7331cce8b",
"channel": "65a52724cfc211c7331cce7b",
"**v": 0
}
]
}
],
"channel": "65a52781cfc211c7331cce8b",
"\_\_v": 0
}
]
},
"message": "fetch successfully",
"success": 200
}
