module.exports = function(){
    var express = require("express"),
        app = express(),
        bodyParser  = require("body-parser"),
        methodOverride = require("method-override");

    var port = process.env.PORT || 8080;
    app.listen(port, function() {});

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    var router = express.Router();

    router.get('/embed', function(req, res) {
       commands.find({"type":"embed"},function(err,result){
           var response = [];
            result.forEach(function(embed){
                if(typeof embed.content === 'string'){
                    response.push(embed.content);
                }else{
                    embed.content.forEach(function(embed2){
                        response.push(embed2);
                    })
                }
            })
            res.send(response);
        })
    });

    app.use(router);
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    //app.listen((process.env.OPENSHIFT_NODEJS_PORT||8080), process.env.OPENSHIFT_NODEJS_IP, function() {console.log(process.env.OPENSHIFT_NODEJS_IP + ":" + process.env.OPENSHIFT_NODEJS_PORT)});
}
