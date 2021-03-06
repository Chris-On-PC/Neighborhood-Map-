'use strict';
// Foursquare API
var ClientID = "O0TEKJDEK3MZWBFXZWZPD4R4MDWJDOI44HNTOBYYINMOQMLA";
var ClientSecret = "LSXQBPX0DYMBZYAUHCSP5JWSNHFGYZBBPW2UUGTLPJ4XEY4A";

var infoWindow;
var map;

// Predefined map locations
var locations = [
  {title: "Home", location: {lat: 51.445073, lng: 5.513121}},
  {title: "High Tech Campus", location: {lat: 51.410953, lng: 5.459404}},
  {title: "Yacht", location: {lat: 51.413885, lng: 5.457192}},
  {title: "Philips Museum", location: {lat: 51.439111, lng: 5.475533}},
  {title: "Bottle Distillery", location: {lat: 51.435869, lng: 5.484804}},
  {title: "DAF Museum", location: {lat: 51.437217, lng: 5.490448}}
  ];

// ViewModel
var MapViewModel = function(){

  var self = this;

  this.markersArray = ko.observableArray([]);

  //Add marker to marker array
  locations.forEach(function(markerItem){
    self.markersArray.push(new Marker(markerItem));
  });

  this.query = ko.observable('');

  this.filteredMarkers = ko.computed(function () {
    var filter = self.query().toLowerCase();

    // Filter by marker name. If no filter applied, show all.
    if (!filter) {
      ko.utils.arrayForEach(self.markersArray(), function (item) {
        if (item.marker) {
          item.marker.setVisible(true);
        }
      });

      return self.markersArray();

    } else {

      return ko.utils.arrayFilter(self.markersArray(), function(item) {
        var result = (item.title.toLowerCase().search(filter) >= 0);

        if (item.marker) {
          item.marker.setVisible(result);
        }
        return result;
        });
    }
  });
};

// Model
var Marker = function(markerItem){
  var self = this;

  this.title = markerItem.title;
  this.lat = markerItem.location.lat;
  this.lng = markerItem.location.lng;
  this.catagory = "";
  this.address = "";

  var Url = "https://api.foursquare.com/v2/venues/search";

  var APIUrl = Url + "?ll="+ self.lat + "," + self.lng + "&client_id="
  + ClientID + "&client_secret=" + ClientSecret + "&v=20180323" +
  "&query=" + self.title;

  // Retrive marker information from foursquare API
   $.getJSON(APIUrl, function(data) {
    var result = data.response.venues[0];

    var marker = new google.maps.Marker({
          position: {
          lat: self.lat,
          lng: self.lng
          },
          animation: google.maps.Animation.DROP,
          map: map,
          formatted_address: result.location.formattedAddress,
          title: result.name,
          catagory: result.categories[0].name       
      });
      marker.addListener("click", clickedMarker);
      self.marker = marker;
      
      }).fail(function() {
        window.alert("Failed to retrieve data.");
   });
};

// Initialize new map
function initMap() {

  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 51.441642, lng: 5.469722},
    zoom: 12,
    mapTypeControl: false
  });
  ko.applyBindings( new MapViewModel() );
}

// Create info windows
var displayInfoWindow = function(marker) {
  var self = this;

  // initialize infowinow content
  var infoContent = '<div class="infoContent">' +
  '<h4 id="heading" class="heading">' + marker.title + '</h4>' +
  '<p>Catagory: ' + marker.catagory + '<br>' +
  'Address: ' + marker.formatted_address + '<br>' +
  '<img src="img/Foursquare.png" class="foursquareImg" />'+
  '</div>';

  if (infoWindow) {
    infoWindow.close();
  }

  infoWindow = new google.maps.InfoWindow({
    content: infoContent
  });

  infoWindow.open(map, marker);
};

var clickedListItem = function () {
  clickAnimation( this.marker );
};

var clickedMarker = function () {
  clickAnimation( this );
};

// Animate marker when marker is clicked and list item is clicked
var clickAnimation = function (marker) {
  markerAnimation( marker );
  displayInfoWindow( marker );
};

var markerAnimation = function (marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    });
  }
};

// Error handling of google maps api
function googleMapsCustomError(){
  if (map == null) {
    window.alert("Google Maps Error");
  }
}

// Sidebar functionality
$(document).ready(function () {

    $('.sidebarCollapse').on('click', function () {
        $('.sidebar').toggleClass('active');
    });
});