$.ajaxSetup({
  async: false
});

var map, cities, votes;

function initialize() {
  // Map Setting
  $('#map-canvas').height(window.outerHeight / 1.5);

  // Map Initial Position
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 7,
    center: {lat: 23.999479, lng: 121.606658}
  });

  $.getJSON('../data/city_legislator.json', function(data){
    votes = data;
  });

  // Initial villages border
  $.getJSON('https://raw.githubusercontent.com/g0v/twgeojson/master/json/twCounty2010.topo.json', function(data) {
    var geoJson = topojson.feature(data, data.objects.layer1);

    cities = map.data.addGeoJson(geoJson);
  });

  drawMap('中國國民黨', 'blue')
}

function drawMap(party, color){
  var max = 0;
  cities.forEach(function(value) {
    value.O.COUNTYNAME = value.O.COUNTYNAME
                          .replace('台', '臺')
                          .replace('臺北縣', '新北市')
                          .replace('桃園縣', '桃園市')
                          .replace('臺中縣', '臺中市')
                          .replace('臺南縣', '臺南市')
                          .replace('高雄縣', '高雄市');
    var cityName = value.O.COUNTYNAME;
    if(!votes[cityName]){
      console.log(cityName);
      return;
    }
    var cityVotes = votes[cityName].filter(function(item){ return item.party == party })[0];

    if(!cityVotes){
      cityVotes = {
        party: party,
        count: 0
      }
    }

    if(cityVotes.count >= max){
      max = cityVotes.count;
    }

    value.setProperty('votes', cityVotes);
  });
  step = max / 10;

  map.data.setStyle(function(feature) {
    var cityVotes = feature.getProperty('votes');
    if(!cityVotes){
      return;
    }

    var colorMap = chroma.scale(['white', color]).colors(11);
    var level = Math.floor(cityVotes.count / step);

    return {
      fillColor: colorMap[level],
      fillOpacity: 0.6,
      strokeColor: 'gray',
      strokeWeight: 1
    }
  });

  map.data.addListener('mouseover', function(event) {
    var cityName = event.feature.O.COUNTYNAME;
    var cityVotes = event.feature.getProperty('votes');

    map.data.revertStyle();
    map.data.overrideStyle(event.feature, {
      fillColor: 'red'
    });

    $('#content').html('<div>' + cityName + '(' + cityVotes.count + '票)' + '</div>').removeClass('text-muted');
  });

  map.data.addListener('mouseout', function(event) {
    map.data.revertStyle();
    $('#content').html('在地圖上滑動或點選以顯示數據').addClass('text-muted');
  });

  map.data.addListener('click', function(event) {
    var cityName = event.feature.O.COUNTYNAME;
  });

  $('h1').html('2016 ' + party +  '立委票數分布');
  $('.party-button-list > a').removeClass('active');
  $('.party-button-list > a:contains(' + party + ')').addClass('active');
}

google.maps.event.addDomListener(window, 'load', initialize);
