  var map, places, iw;
  var markers = [];
  var searchTimeout;
  var centerMarker;
  var autocomplete;
  var hostnameRegexp = new RegExp('^https?://.+?/');
  var myLatlng;

  function initialize() {
      myLatlng =  new google.maps.LatLng(41.880, -87.627);
      var myOptions = {
          zoom: 17,
          center: myLatlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
      places = new google.maps.places.PlacesService(map);
      google.maps.event.addListener(map, 'tilesloaded', tilesLoaded);

      document.getElementById('keyword').onkeyup = function (e) {
          if (!e) var e = window.event;
          if (e.keyCode != 13) return;
          document.getElementById('keyword').blur();
          search(document.getElementById('keyword').value);
      }

      var typeSelect = document.getElementById('type');
      typeSelect.onchange = function () {
          search();
      };

      var rankBySelect = document.getElementById('rankBy');
      rankBySelect.onchange = function () {
          search();
      };

  }

  function tilesLoaded() {
      search();
      google.maps.event.clearListeners(map, 'tilesloaded');
      google.maps.event.addListener(map, 'zoom_changed', searchIfRankByProminence);
      google.maps.event.addListener(map, 'dragend', search);
  }

  function searchIfRankByProminence() {
      if (document.getElementById('rankBy').value == 'prominence') {
          search();
      }
  }

  function search() {
      clearResults();
      clearMarkers();

      if (searchTimeout) {
          window.clearTimeout(searchTimeout);
      }
      searchTimeout = window.setTimeout(reallyDoSearch, 500);
  }

  function reallyDoSearch() {
      var type = document.getElementById('type').value;
      var keyword = document.getElementById('keyword').value;
      var rankBy = document.getElementById('rankBy').value;

      var search = {};

      if (keyword) {
          search.keyword = keyword;
      }

      if (type != 'establishment') {
          search.types = [type];
      }

      if (rankBy == 'distance' && (search.types || search.keyword)) {
          search.rankBy = google.maps.places.RankBy.DISTANCE;
          search.location = map.getCenter();
          centerMarker = new google.maps.Marker({
              position: search.location,
              animation: google.maps.Animation.DROP,
              map: map
          });
      } else {
          search.bounds = map.getBounds();
      }

      places.search(search, function (results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
              for (var i = 0; i < results.length; i++) {

                  var distance = ((Math.round(google.maps.geometry.spherical.computeDistanceBetween(myLatlng, results[i].geometry.location)))/1609).toFixed(2);

                  console.log(distance, results[i]);

                  markers.push(new google.maps.Marker({
                      position: results[i].geometry.location,
                      //animation: google.maps.Animation.DROP
                  }));
                  google.maps.event.addListener(markers[i], 'click', getDetails(results[i], i));
                  window.setTimeout(dropMarker(i), i * 100);
                  addResult(results[i], i, distance);
              }
          }
      });
  }

  function clearMarkers() {
      for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
      }
      markers = [];
      if (centerMarker) {
          centerMarker.setMap(null);
      }
  }

  function dropMarker(i) {
      return function () {
          if (markers[i]) {
              markers[i].setMap(map);
          }
      }
  }

  function addResult(result, i, distance) {

      var results = document.getElementById('results');
      //var tr = document.createElement('tr');
      var onsItem = document.createElement('ons-list-item');
      onsItem.onclick = function () {
           google.maps.event.trigger(markers[i], 'click');
       };

      var name = document.createTextNode(result.name + ' - ' + distance + ' mi');
      onsItem.appendChild(name);
      document.getElementById('results').appendChild(onsItem);

      //document.querySelector('#question-page').onInfiniteScroll = addItems(name);

  }
  function addItems(name) {

      for(var y=0; y < 4; y++) {
            onsItem.appendChild(name);
            document.getElementById('results').appendChild(onsItem);
          }
  }



  function clearResults() {
      var results = document.getElementById('results');
      while (results.childNodes[0]) {
          results.removeChild(results.childNodes[0]);
      }
  }

  function getDetails(result, i) {
      return function () {
          places.getDetails({
              reference: result.reference
          }, showInfoWindow(i));
      }
  }

  function showInfoWindow(i) {
      return function (place, status) {
          if (iw) {
              iw.close();
              iw = null;
          }

          if (status == google.maps.places.PlacesServiceStatus.OK) {
              iw = new google.maps.InfoWindow({
                  content: getIWContent(place)
              });
              iw.open(map, markers[i]);
          }
      }
  }

  function getIWContent(place) {
      var content = '';
      content += '<table>';
      content += '<tr class="iw_table_row">';
      content += '<td style="text-align: right"><img class="hotelIcon" src="' + place.photos[0].getUrl({ 'maxWidth': 50, 'maxHeight': 50 }) + '"/></td>';
      content += '<td id="link"><b><a href="' + place.url + '">' + place.name + '</a></b></td></tr>';
      content += '<tr class="iw_table_row"><td class="iw_attribute_name">Address:</td><td>' + place.vicinity + '</td></tr>';
      if (place.formatted_phone_number) {
          content += '<tr class="iw_table_row"><td class="iw_attribute_name">Telephone:</td><td>' + place.formatted_phone_number + '</td></tr>';
      }
      if (place.rating) {
          var ratingHtml = '';
          for (var i = 0; i < 5; i++) {
              if (place.rating < (i + 0.5)) {
                  ratingHtml += '&#10025;';
              } else {
                  ratingHtml += '&#10029;';
              }
          }
          content += '<tr class="iw_table_row"><td class="iw_attribute_name">Rating:</td><td><span id="rating">' + ratingHtml + '</span></td></tr>';
      }
      if (place.website) {
          var fullUrl = place.website;
          var website = hostnameRegexp.exec(place.website);
          if (website == null) {
              website = 'http://' + place.website + '/';
              fullUrl = website;
          }
          content += '<tr class="iw_table_row"><td class="iw_attribute_name">Website:</td><td><a href="' + fullUrl + '">' + website + '</a></td></tr>';
      }
      // content += '<tr class="iw_table_row"><td class="iw_attribute_name">Favorite:</td><td></td></tr>';
      content += '</table>';
      content += '<button class="fav-btn"><span href="" class="favme dashicons dashicons-heart"></span></button>';
      return content;
  }

  //initialize();



//window.onload = getMyLocation;

// var map;
// var latLng = {lat: 41.880, lng: -87.631};
// var nearByService;
// var marker;

// function getMyLocation() {
//   if(navigator.geolocation){
//     navigator.geolocation.getCurrentPostion(displayLocation);
//   } else {
//     alert('Oops, no geolocation support');
//   }
// }

//This function is invoked asynchronously by the HTML5 geolocation API.
// function displayLocation(position) {
//   //The latitude and longitude values obtained from HTML5 API
//   var latitude = position.coords.latitude;
//   var longitude = position.coords.longitude;

//   //Creating a new object for using latitude and longitude values with Google Map.
  
//   //new google.maps.LatLng(latitude,longitude);

//   showMap(latLng);

//   addNearByPlaces(latLng);
//   apiMarkerCreate(latLng);

// }

// function showMap() {
//   //Setting up the map options like zoom leverl, map type.
//   var mapOptions = {
//     center: latLng,
//     zoom: 17,
//     //mapTypeId: google.maps.mapTypeId.ROADMAP
//   };

//   //Creating the Map instances and assigning the HTM div element to render it in.
//   map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

//   addNearByPlaces(latLng);
//   apiMarkerCreate(latLng);
// }

// function addNearByPlaces(latLng) {

//   nearByService = new google.maps.places.PlacesService(map);

//   var request = {
//     location: latLng,
//     radius: 3221,
//     type: ['point_of_interest']
//   };

//   nearByService.nearbySearch(request, searchNearBy);
// }

// function searchNearBy(results, status) {
//   if (status == google.maps.places.PlacesServiceStatus.OK) {
//     for (var i = 0; i < results.length; i++) {
//       var place = results[i];
//       apiMarkerCreate(place.geometry.location, place);
//     }
//   }
// }

// function apiMarkerCreate(latLng, placeResult) {
//   var markerOptions = {
//     position: latLng,
//     map: map,
//     animation: google.maps.animation.DROP,
//     clickable: true
//   }

//   //Setting up the marker object to mark the location on the map.
//   marker = new google.maps.Marker(markerOptions);

//   if (placeResult) {
//     var content = placeResult.name + '<br>' + placeResult.vicinity + '<br>' + placeResult.types;
//     windowInfoCreate(marker, latLng, content); 
//   }
//   else {
//     var content = 'You are here: ' + latLng.lat() + ', ' + latLng.lng();
//     windowInfoCreate(marker, latLng, content);
//   }

// }

// function windowInfoCreate(marker, latLng, content) {
//   var infoWindowOptions = {
//     content: content,
//     position: latLng
//   };

//   var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

//   google.maps.event.addListener(marker, 'click', function() {
//     infoWindow.open(map);
//   });
// }



      // var infowindow;
      // var service;
      // var service2;
      // var marker = [];


      // function initMap() {
      //   var pyrmont = {lat: 41.880, lng: -87.631};

      //   map = new google.maps.Map(document.getElementById('map'), {
      //     center: pyrmont,
      //     zoom: 17
      //   });

      //   infowindow = new google.maps.InfoWindow();
      //   service = new google.maps.places.PlacesService(map);
      //   service.nearbySearch({
      //     location: pyrmont,
      //     radius: 3221,
      //     rankBy: google.maps.places.RankBy.DISTANCE,
      //     type: ['point_of_interest']
      //   }, callback);

      //   service.getDetails(request, callback);

      //   }

      // function callback(results, status) {
      //   if (status === google.maps.places.PlacesServiceStatus.OK) {
      //     for (var i = 0; i < results.length; i++) {
      //       createMarker(results[i]);
      //     }
      //   }
      // }

      // function createMarker(place) {
      //   var placeLoc = place.geometry.location;
      //   marker = new google.maps.Marker({
      //     map: map,
      //     position: place.geometry.location
      //   });

      //   google.maps.event.addListener(marker, 'click', function() {
      //     infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
      //           'Place ID: ' + place.place_id + '<br>' +
      //           place.formatted_address + '</div>');
      //     infowindow.open(map, this);
      //   });
      // }