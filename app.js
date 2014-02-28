
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

//region REDIS
var redis = require('redis');
client = redis.createClient();
SiteModel = require('./model/siteModel');
var Site = new SiteModel(client);
var google = Site.create('www.google.ru');
google.save(
    function(err, res){
        console.log("save: "+this.url+", on: "+google.time+"; err: "+err);
        Site.findByUrl(
            'www.google.ru',
            function(err, res, s){
                if(err){
                    console.log("Find by url error: "+err);
                    Site.client.quit();
                }else if(res){
                    console.log('Site found url: '+res.url+"; time: "+res.time);
                    google.remove(function(err, res) {
                        console.log('Remove');
                        this.client.quit();
                    });
                }else {
                    console.log('Site not found');
                    this.client.quit();
                }
            }
        )
    }
)
//endregion


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
