var fs = require("fs");

fs.readdir(__dirname, function(err, items) {
    items.forEach(function(item){
        if(item != "script.js"){
            fs.readFile(item, 'utf8', function (err, data) {
                var objeto = JSON.parse(data);
                console.log(objeto);
                var newfile = {};
                objeto.forEach(function(item){
                    var name = item.name;
                    delete item["name"];
                    delete item["_id"];
                    newfile[name] = item;
                });
                fs.writeFile(item + "final",JSON.stringify(newfile));
            });
        }
    })
});
