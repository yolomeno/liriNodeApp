var keys = require('./keys.js');

var request = require('request');
var Twitter = require('twitter');
var inquirer = require('inquirer');
var fs = require('fs');

var userCommand;
var userValue;

inquirer.prompt({
    type : 'list',
    message: "Hi, I'm LiriBot! I can do any of the following... Please select one!",
    choices : ['Check Your Tweets','Spotify A Song','Movie Search', 'Do What "random.txt" Says!','View LiriBot History Log'],
    default: 'Check Your Tweets',
    name: 'option'
}).then(function(data){
    if(data.option == 'Check Your Tweets') {
        userCommand = 'my-tweets';
        commands[userCommand](userValue);
        commands.logInput("Requested: " + userCommand + ' "' + userValue + '"' );
    };
    if(data.option == 'Spotify A Song') {
        userCommand = 'spotify-this-song';
        inquirer.prompt({
            type : 'input',
            message: 'What Song Should I Spotify?',
            name: 'inputSong',
            default : 'the sign ace of base'
        }).then(function(inputData){
            userValue = inputData.inputSong;
            console.log(userValue);
            commands[userCommand](userValue);
            commands.logInput("Requested: " + userCommand + ' "' + userValue + '"' );
        });
    };
    if(data.option == 'Movie Search') {
        userCommand = 'movie-this';
        inquirer.prompt({
            type : 'input',
            message: 'What Movie Should I Search?',
            name: 'inputMovie',
            default: 'Mr.Nobody'
        }).then(function(inputData){
            userValue = inputData.inputMovie;
            commands[userCommand](userValue);
            commands.logInput("Requested: " + userCommand + ' "' + userValue + '"' );
        });
    };
    if(data.option == 'Do What "random.txt" Says!') {
        userCommand = 'do-what-it-says';
        commands[userCommand](userValue);
        commands.logInput("Requested: " + userCommand + ' "' + userValue + '"' );
    };
    if(data.option == 'View LiriBot History Log') {
        userCommand = 'logView';
        commands[userCommand](userValue);
        commands.logInput("Requested: " + userCommand + ' "' + userValue + '"' );
    };
});

var commands = {
    'my-tweets' : function() {
        var client = new Twitter(keys.twitterKeys);
        var params = {
            screen_name: 'yolomeno22'
        };
        client.get('statuses/user_timeline', params, function(error, tweets, response) {
            if (!error) {
                for ( var key in tweets) {
                    console.log(key + ": " + tweets[key].text);
                    commands.logOutput(key + ": " + tweets[key].text);
                };
            };
        });
    },
    'spotify-this-song' : function(userValue) {
        var url = 'https://api.spotify.com/v1/search?';
        var params = {
            'q' : userValue,
            'type' : 'track'
        };
        request({url, qs:params}, (error, response, body)=> {
            var spotifyRes = JSON.parse(body, null , 2)
            if (!error && response.statusCode === 200 && spotifyRes.tracks.items.length > 0) {
                var dataArray = ['Artist: ' + spotifyRes.tracks.items[0].artists[0].name,'Song: ' + spotifyRes.tracks.items[0].name, 'Spotify Song Preview: ' + spotifyRes.tracks.items[0].preview_url, 'Album: ' + spotifyRes.tracks.items[0].album.name];
                dataArray.forEach(function(data){
                    console.log(data);
                    commands.logOutput(data);
                });
            } else if (!error && response.statusCode === 200 && spotifyRes.tracks.items.length <= 0) {
                console.log("Sorry, no matches found try typing it diffrently.");
                commands.logOutput("Sorry, no matches found try typing it diffrently.");
            } else {
                console.log("Got an error: ", error, ", status code: ", response.statusCode);
                commands.logOutput("Got an error: ", error, ", status code: ", response.statusCode);
            };
        });
    },
    'movie-this': function(userValue) {
        var url = 'http://www.omdbapi.com/?';
        var params = {
            'apikey': keys.movieKeys.apikey,
            't' : userValue,
            'type' : 'movie'
        };
        request({url, qs:params}, (error, response, body)=> {
            var OMDbRes = JSON.parse(body, null, 2)
            if (!error && response.statusCode === 200 && (OMDbRes.Response != 'False') ) {
                var dataArray = ['Title: ' + OMDbRes.Title, 'Year: ' + OMDbRes.Year, 'IMDB Rating: ' + OMDbRes.imdbRating, 'Country: ' + OMDbRes.Country, 'Language: ' + OMDbRes.Language, 'Plot: ' + OMDbRes.Plot, 'Actors: ' + OMDbRes.Actors, OMDbRes.Ratings[1].Source + ' Rating: ' + OMDbRes.Ratings[1].Value];
                dataArray.forEach(function(data){
                    console.log(data);
                    commands.logOutput(data);
                });
            } else if (!error && response.statusCode === 200 && OMDbRes.Response == 'False') {
                console.log(OMDbRes.Error);
                commands.logOutput(OMDbRes.Error);
            } else {
                console.log("Got an error: ", error, ", status code: ", response.statusCode);
                commands.logOutput("Got an error: ", error, ", status code: ", response.statusCode);
            };
        });
    },
    'do-what-it-says': function(){
        fs.readFile('random.txt', 'utf8', (err, data)=>{
            var content = data.split(',');
            commands[content[0]](content[1]);
        });
    },
    'logInput': function(write) {
        fs.appendFile('log.txt','*' + write );
    },
    'logOutput': function(write) {
        fs.appendFile('log.txt','/' + write );
    },
    'logView': function(){
        fs.readFile('log.txt','utf8',(err, data)=> {
            var blocks = data.split('*');
            blocks.forEach(function(data){
                console.log('======================LOG INSTANCE DIVIDER============================');
                console.log(data.split('/'));
            });
        });
    }
};