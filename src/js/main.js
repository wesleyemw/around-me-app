import maplibregl from "maplibre-gl";
import OpacityControl from "maplibre-gl-opacity";
import { OverpassClient } from "@andreasnicolaou/overpass-client";
import { toFeature } from "./utils";
import definitions from "./definitions";

const initialPosition = {
	lon: 2.349014,
	lat: 48.864716,
};

const map = new maplibregl.Map({
	container: "map", // container id
	style: "https://tiles.openfreemap.org/styles/bright",
	// style: {
	//     version: 8,
	//     sources: {
	//         o_std: {
	//             type: 'raster',
	//             tiles: [
	//                 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
	//                 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
	//             ],
	//             tileSize: 256,
	//         },
	//     },
	//     layers: [
	//         {
	//             id: 'o_std',
	//             type: 'raster',
	//             source: 'o_std',
	//             minzoom: 0,
	//             maxzoom: 18,
	//         },
	//     ],
	// },
	// paris starting position
	center: [initialPosition.lon, initialPosition.lat],
	zoom: 15,
});

map.on("load", async function () {
	// getAmenities(initialPosition.lat, initialPosition.lon);
	// MIERUNE Color
	// map.addSource('m_color', {
	//     type: 'raster',
	//     tiles: ['https://tile.mierune.co.jp/mierune/{z}/{x}/{y}.png'],
	//     tileSize: 256,
	// });
	// map.addLayer({
	//     id: 'm_color',
	//     type: 'raster',
	//     source: 'm_color',
	//     minzoom: 0,
	//     maxzoom: 18,
	// });

	// OpenStreetMap
	// map.addSource('o_std', {
	//     type: 'raster',
	//     tiles: [
	//         'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
	//         'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
	//     ],
	//     tileSize: 256,
	// });
	// map.addLayer({
	//     id: 'o_std',
	//     type: 'raster',
	//     source: 'o_std',
	//     minzoom: 0,
	//     maxzoom: 18,
	// });

	// GSI Pale
	map.addSource("t_pale", {
		type: "raster",
		tiles: ["https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"],
		tileSize: 256,
	});
	map.addLayer({
		id: "t_pale",
		type: "raster",
		source: "t_pale",
		minzoom: 0,
		maxzoom: 22,
	});

	// GSI Ort
	map.addSource("t_ort", {
		type: "raster",
		tiles: ["https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg"],
		tileSize: 256,
	});
	map.addLayer({
		id: "t_ort",
		type: "raster",
		source: "t_ort",
		minzoom: 0,
		maxzoom: 22,
	});

	// BaseLayer
	// const mapBaseLayer = {
	//     o_std: 'Open Street Maps',
	//     m_color: 'MIERUNE Color',
	// };

	// OverLayer
	const mapOverLayer = {
		t_pale: "GSI Pale",
		t_ort: "GSI Ort",
	};

	// OpacityControl
	let Opacity = new OpacityControl({
		// baseLayers: mapBaseLayer,
		overLayers: mapOverLayer,
		opacityControl: true,
	});
	map.addControl(Opacity, "bottom-left");

	// NavigationControl
	let nc = new maplibregl.NavigationControl();
	map.addControl(nc, "top-right");

	// Add geolocate control to the map.
	let locate = new maplibregl.GeolocateControl({
		positionOptions: {
			enableHighAccuracy: true,
		},
		trackUserLocation: false,
	});
	map.addControl(locate, "top-right");

	// locate.on('geolocate', (e)=> {
	//     getAmenities(e.coords.latitude, e.coords.longitude);
	// });

	// get data by bounding box
	// let bbox = map.getBounds();
	// //console.log(bbox);
	// // [minLat, minLon, maxLat, maxLon]
	// let points = {
	// 	minLat: bbox._sw.lat,
	// 	minLon: bbox._sw.lng,
	// 	maxLat: bbox._ne.lat,
	// 	maxLon: bbox._ne.lng,
	// };
	// // console.log(points);
	// const tags = { amenity: ["cafe", "restaurant"] };
	// const overpassClient = new OverpassClient();
	// const box = [points.minLat, points.minLon, points.maxLat, points.maxLon]; // [minLat, minLon, maxLat, maxLon]
	// overpassClient.getElementsByBoundingBox(tags, box).subscribe((response) => {
	// 	// console.log(response);
	// });
});

// get data on map zoom - could be good to only show the form on a more apropriate zoom range

function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function getAmenitiesByBbox(tagsObj) {
	let bbox = map.getBounds();
	let points = {
		minLat: bbox._sw.lat,
		minLon: bbox._sw.lng,
		maxLat: bbox._ne.lat,
		maxLon: bbox._ne.lng,
	};
	const tags = tagsObj;
	const overpassClient = new OverpassClient();
	const box = [points.minLat, points.minLon, points.maxLat, points.maxLon]; // [minLat, minLon, maxLat, maxLon]
	const elements = ["node"];
	overpassClient
		.getElementsByBoundingBox(tags, box, elements)
		.subscribe((response) => {
			// console.log(Object.values(tagsObj)[0][0]);
			// console.log(response.elements);
			let featureName = Object.values(tagsObj)[0][0];

			if (response.elements.length != 0) {
				console.log(`${featureName} has ${response.elements.length} items.`);
				let items = [];
				let geo = {};

				geo["type"] = "FeatureCollection";
				geo["features"] = [];
				items.push(...response.elements);
				items.forEach((item) => {
					geo["features"].push(toFeature(item));
				});
				console.log(geo);

				const geoJSONcontent = geo;
				map.addSource(`layer_${featureName}`, {
					type: "geojson",
					data: geoJSONcontent,
				});
				map.addLayer({
					id: `points_${featureName}`,
					type: "circle",
					source: `layer_${featureName}`,
					minzoom: 12,
					paint: {
						"circle-radius": 12,
						"circle-stroke-width": 1,
						"circle-color": "red",
						"circle-stroke-color": "white",
						"circle-opacity": 0.5,
					},
				});
			}
		});
}

function getAmenitiesByRadius(lat, lon) {
	const overpassClient = new OverpassClient();
	const tags = { amenity: ["restaurant"] };
	const radius = 1000;
	overpassClient
		.getElementsByRadius(tags, lat, lon, radius)
		.subscribe((response) => {
			let items = [];
			let geo = {};
			geo["type"] = "FeatureCollection";
			geo["features"] = [];
			console.log(response.elements);

			items.push(...response.elements);
			items.forEach((item) => {
				geo["features"].push(toFeature(item));
			});
			console.log(geo);
			const geoJSONcontent = geo;
			map.addSource("restaurants", {
				type: "geojson",
				data: geoJSONcontent,
			});
			map.addLayer({
				id: "reverse_points",
				type: "circle",
				source: "restaurants",
				minzoom: 12,
				paint: {
					"circle-radius": 12,
					"circle-stroke-width": 1,
					"circle-color": "red",
					"circle-stroke-color": "white",
					"circle-opacity": 0.5,
				},
			});
		});
}

function tagsToObjects(arr) {
	const allObjs = [];
	for (const item of arr) {
		const itemExploded = item.split("=");
		const result = {};
		result[`${itemExploded[0]}`] = [itemExploded[1]];
		allObjs.push(result);
	}
	return allObjs;
}
// const foodObjects = tagsToObjects(food);
// const transportObjects = tagsToObjects(transport);
// const utilsObjects = tagsToObjects(utils);

const featuresForm = document.querySelector("form.features");

// check map.zoomTo() method

/**
 * Check features on the active bounding box
 */

let featureItems = [];
let featureNames = [];

featuresForm.addEventListener("change", (e) => {
	if (!e.target.checked) return;
	const featureType = e.target.getAttribute("name");
	featureItems = tagsToObjects(definitions[featureType]);
	featureItems.forEach((item, index) => {
		const featureName = Object.values(item)[0][0];
		featureNames.push(featureName);
		let interval = 5000;
		setTimeout(function () {
			// console.log(featureName);
			getAmenitiesByBbox(item);
		}, index * interval);
	});
	console.log(featureNames);
});

map.on("zoom", function () {
	// console.log(map.getBounds());
	// console.log(map.getZoom());
	// console.log(featureNames);
	if (featureNames.length > 0) {
		featureNames.forEach((featureName) => {
			if (map.getLayer(`layer_${featureName}`)) {
				map.removeLayer(`layer_${featureName}`);

				if (map.getSource(`layer_${featureName}`)) {
					map.removeSource(`layer_${featureName}`);
				}
			}
		});
	}
});
// check this example to understand how to update the map dinamicaly
// https://maplibre.org/maplibre-gl-js/docs/examples/add-live-realtime-data/
// Update the drone symbol's location on the map
// map.getSource("drone").setData(json);
