//Necessary variables
var map;
var shelter = new L.LayerGroup([]);

//Object for Layer Control
var overlays = {
	"Shelter" : shelter
}

// Function to draw your map
var drawMap = function() {
	var data = [
		{"name":"Hope Place, Women and Children's Shelter",
		"address":"3802 South Othello Street",
		"zip": "98118",
		"number":"206.628.2008",
		"pads":"high",
		"tampons":"low",
		"cup":"medium",
		"liners":"high",
		"lat": 47.5373054,
		"lng":-122.2840283
		},
		
		
	];

  // Create map and set view
 	var map = L.map('container').setView([47.5373054, -122.28402829999999], 12);
 	map.addLayer(new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'));	//base layer
 	map.addControl(new L.Control.Search({
 		layer: shelter, 
 		container: 'findbox',
 		initial: false,
 		collapsed: false
 	}) );
 	for(i in data) {
		var title = data[i].name,
			zip = data[i].zip,
			//value searched
			name = data[i].name,
			address = data[i].address,
			number = data[i].number,
			pads = data[i].pads,
			tampons = data[i].tampons,
			cup = data[i].cup,
			liners = data[i].liners,
			lat = data[i].lat,
			lng = data[i].lng,		//position found
			circle = new L.circleMarker([lat, lng], {
 			color: 'red',
			radius: 10
		});

 		//Add Pop-up
		circle.bindPopup("<h3>Name of Shelter: " + name + " </h3>" +  
			"<b><p>Address: " + address + " " + zip + "<br>Number: " + number +
			"</p></b><p>Pads: " + pads + "</p><p>Tampons: " + tampons + "</p><p>Menstrual Cups: " + cup +
			"</p><p>Panty Liners: " + liners + "</p>");

		circle.addTo(shelter);
 	}
	shelter.addTo(map);
	}

  