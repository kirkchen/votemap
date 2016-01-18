$.ajaxSetup({
  async: false
});

var map, cunli, votes;

function initialize() {
  // Map Setting
  $('#map-canvas').height(window.outerHeight / 2.2);

  // Map Initial Position
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 10,
    center: {
      lat: 22.643894,
      lng: 120.317828
    }
  });

  $.getJSON('https://raw.githubusercontent.com/tony1223/crawl2016votes/master/outputs/votes_all.json', function(data) {
  // $.getJSON('/data/vote_kaohsung.json', function(data) {
    votes = data;
  });

  // Initial villages border
  $.getJSON('data/cunli.json', function(data) {
    var geoJson = topojson.feature(data, data.objects.cunli);
    // geoJson.features = geoJson.features.filter(function(item){
    //   return item.properties.C_Name === '高雄市';
    // })

    cunli = map.data.addGeoJson(geoJson);
  });

  cunli.forEach(function(value) {
    var areaname = value.getProperty('T_Name');
    var villagename = value.getProperty('V_Name');
    var datas = {};

    votes.forEach(function(vote, index) {
      if (vote.areaname != areaname || vote.villagename != villagename) {
        return;
      }

      vote["v"]["區域立委"].forEach(function(n) {
        if (!datas[n.pt]) {
          datas[n.pt] = 0
        }

        datas[n.pt] += parseInt(n.c.replace(","), 10);
      });
    })

    var result = [];
    for (var key in datas) {
      var tmp = {};
      tmp.pt = key;
      tmp.count = datas[key];

      result.push(tmp);
    }

    result.sort(function(a, b) {
      return b.count - a.count;
    })

    value.setProperty('datas', result);
  });

  map.data.setStyle(function(feature) {
    color = ColorBar(feature.getProperty('datas'));
    feature.setProperty('pt', color.name);
    if (!color.value) {
      return;
    }

    return {
      fillColor: color.value,
      fillOpacity: 0.6,
      strokeColor: 'gray',
      strokeWeight: 1
    }
  });

  map.data.addListener('mouseover', function(event) {
    var Cunli = event.feature.getProperty('C_Name') + event.feature.getProperty('T_Name') + event.feature.getProperty('V_Name');
    map.data.revertStyle();
    map.data.overrideStyle(event.feature, {
      fillColor: 'white'
    });

    var datas = event.feature.getProperty('datas');
    var vote = datas[0];
    if(!vote){
      return;
    }

    $('#content').html('<div>' + Cunli + ' ：' + vote.pt + '(' + vote.count + ')' + ' 票</div>').removeClass('text-muted');
  });

  map.data.addListener('mouseout', function(event) {
    map.data.revertStyle();
    $('#content').html('在地圖上滑動或點選以顯示數據').addClass('text-muted');
  });

  map.data.addListener('click', function(event) {
    var Cunli = event.feature.getProperty('VILLAGE_ID');
    var CunliTitle = event.feature.getProperty('C_Name') + event.feature.getProperty('T_Name') + event.feature.getProperty('V_Name');
    var datas = event.feature.getProperty('datas');

    datas = datas.map(function(data){
      return {
        name: data.pt,
        y: data.count
      }
    })

    $('#chart').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: CunliTitle
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Votes',
                colorByPoint: true,
                data: datas
            }]
        });
  });
}

$(window).resize(function() {
  var len = $('#myTabContent > .tab-pane').length;
  for (var i = 0; i < len; i++) {
    $('#myTabContent > .tab-pane').eq(i).highcharts().setSize($('#myTabContent').width(), $('#myTabContent').height());
  }
});

google.maps.event.addDomListener(window, 'load', initialize);
