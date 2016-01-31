//Necessary variables
var map;
var shelter = new L.LayerGroup([]);

//Object for Layer Control
var overlays = {
	"Shelter" : shelter
}

// Function to draw your map
var drawMap = function() {

  // Create map and set view
 	map = L.map('container').setView([47.5373054, -122.28402829999999], 12);

  // Create a tile layer variable using the appropriate url
  	var layer = L.tileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2FraXV3YSIsImEiOiJjaWZ4MjZqcTQzbHJtdTNtMjJzdm5lcG9tIn0.Bo6KigV9UiQoLiKA5_j22Q');
  // Add the layer to your map
 	layer.addTo(map);

  // Execute your function to get data
	getData();
}

// Function for getting data
var getData = function() {

	var data = $.ajax({
		url:'data/shelters.json',
		type: 'get',
		success: function(data) {
			customBuild(data);
		},
		dataType: 'json'
	});
}

// Loop through your data and add the appropriate layers and points
var customBuild = function(data) {
	//Layer Control
	L.control.layers(null, overlays).addTo(map);

	//Loop through data
	for (i = 0; i < data.length; i++) {
		//Necessary variables
		var name = data[i]['name'];
		var address = data[i]['address'];
		var zip = data[i]['zip'];
		var number = data[i]['number'];
		var pads = data[i]['pads'];
		var tampons = data[i]['tampons'];
		var cup = data[i]['cup'];
		var liners = data[i]['liners'];
		var lat = data[i]['lat'];
		var lng = data[i]['lng'];
		var circle;

		circle = new L.circleMarker([lat, lng], {
			color: 'red',
			radius: 5
		});

		//Add Pop-up
		circle.bindPopup("<h3>Name of Shelter: " + name + " </h3>" +  
			"<b><p>Address: " + address + " " + zip + "<br>Number: " + number +
			"</p></b><p>Pads: " + pads + "</p><p>Tampons: " + tampons + "</p><p>Menstrual Cups: " + cup +
			"</p><p>Panty Liners: " + liners + "</p>");

		//Sort circle into corresponding layer group
		circle.addTo(shelter);
	}
	shelter.addTo(map);
}




