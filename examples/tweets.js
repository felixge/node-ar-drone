
var Twit = require('twit')

var T = new Twit({
    consumer_key:         '...'
  , consumer_secret:      '...'
  , access_token:         '...'
  , access_token_secret:  '...'
})

var stream = T.stream('user')

stream.on('tweet', function (tweet) {
  console.log(tweet.text.split(" ").slice(1).join(" "))
})

function handleError(err) {
  console.error('response status:', err.statusCode);
  console.error('data:', err.data);
}
