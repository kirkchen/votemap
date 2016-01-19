//載入 sqlite3
var sqlite3 = require("sqlite3").verbose();
var fs = require('fs');
var file = "./data/election.db";
var db = new sqlite3.Database(file);

db.serialize(function() {
  var command = 'select cityname, party, sum(vote.count) as count    \
                 from voteplace                                      \
                 inner join vote on vote.voteplace_id = voteplace.id \
                 group by cityname, party';
  var result = {};

  db.each(command, function(err, row) {
    console.log(row.cityname + ": " + row.party + ': ' + row.count);
    if(!row.cityname || !row.party || !row.count){
      return false;
    }

    if(!result[row.cityname]){
      result[row.cityname] = [];
    }

    result[row.cityname].push({
      party: row.party,
      count: row.count
    })
  }, function(){
    fs.writeFileSync('./data/city_legislator.json', JSON.stringify(result));
    console.log('Finish');
  });
});

db.close();
