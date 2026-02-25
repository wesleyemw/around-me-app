import maplibregl from "maplibre-gl";
import OpacityControl from "maplibre-gl-opacity";
import { OverpassClient } from "@andreasnicolaou/overpass-client";
import { toFeature } from "./modules/utils";
import definitions from "./modules/definitions";

const initialPosition = {
  lon: 2.349014,
  lat: 48.864716,
};

const map = new maplibregl.Map({
  container: "map", // container id
  style: "https://tiles.openfreemap.org/styles/bright",
  // paris starting position
  center: [initialPosition.lon, initialPosition.lat],
  zoom: 15,
});

map.on("load", async () => {
  const image = await map.loadImage(
    "https://maplibre.org/maplibre-gl-js/docs/assets/custom_marker.png",
  );
  // Add an image to use as a custom marker
  map.addImage("custom-marker", image.data);
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
  const Opacity = new OpacityControl({
    // baseLayers: mapBaseLayer,
    overLayers: mapOverLayer,
    opacityControl: true,
  });
  map.addControl(Opacity, "bottom-left");

  // NavigationControl
  const nc = new maplibregl.NavigationControl({
    visualizePitch: true,
    showZoom: true,
    showCompass: true,
  });
  map.addControl(nc, "top-right");

  // Add geolocate control to the map.
  const locate = new maplibregl.GeolocateControl({
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

  // all items from definitions to an array
  // biome-ignore lint/style/useConst: needed to be a let to reassign later
  let definitionsArr;

  // definitions as tags
  const allTags = [];

  definitionsArr = Object.values(definitions);
  definitionsArr.forEach((item) => {
    for (const i of item) {
      const itemSeparated = i.split("=");
      const result = `${itemSeparated[0]}_${itemSeparated[1].trim()}`;
      allTags.push(result);
    }
  });
  // create all layers and populate them later
  allTags.forEach((tag) => {
    // console.log(`layer_${tag}`);
    map.addSource(`layer_${tag}`, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [0, 0],
            },
          },
        ],
      },
    });
    map.addLayer({
      id: `points_${tag}`,
      type: "symbol",
      source: `layer_${tag}`,
      minzoom: 12,
      // layout: {
      // 	"icon-image": "custom-marker",
      // 	"icon-overlap": "always",
      // },
      // paint: {
      // 	"circle-radius": 8,
      // 	"circle-stroke-width": 1,
      // 	"circle-color": "red",
      // 	"circle-stroke-color": "white",
      // 	"circle-opacity": 0.5,
      // },
    });
  });
  //getAmenitiesByBbox({ tourism: ["museum"] });
  //getAmenitiesByBbox({ station: ["subway"] });
});

// get data on map zoom - could be good to only show the form on a more apropriate zoom range

// function delay(ms) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// }

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

      const category = Object.keys(tags)[0];
      const featureName = Object.values(tags)[0][0];
      //console.log("new layer name:", `layer_${category}_${featureName}`);

      if (response.elements.length != 0) {
        // console.log(`${featureName} has ${response.elements.length} items.`);
        // activeLayersNames.push(`layer_${category}_${featureName}`);
        const items = [];
        const geo = {};

        const rightPanel = document.querySelector(".overlay.right");

        geo.type = "FeatureCollection";
        geo.features = [];

        // clear the array
        items.length = 0;
        items.push(...response.elements);
        items.forEach((item) => {
          geo.features.push(toFeature(item));
        });

        geo.features.forEach((marker) => {
          // create a DOM element for the marker
          const el = document.createElement("div");
          el.classList = `marker layer_${category}_${featureName}`;
          el.addEventListener("click", () => {
            // console.log(marker.properties);
            if (rightPanel !== null) {
              rightPanel.classList.add("open");
            }
          });

          // add marker to map
          new maplibregl.Marker({ element: el })
            .setLngLat(marker.geometry.coordinates)
            .addTo(map);
        });

        const geoJSONcontent = geo;
        map
          .getSource(`layer_${category}_${featureName}`)
          .setData(geoJSONcontent);
      }
    });
}

// function getAmenitiesByRadius(lat, lon) {
// 	const overpassClient = new OverpassClient();
// 	const tags = { amenity: ["restaurant"] };
// 	const radius = 1000;
// 	overpassClient
// 		.getElementsByRadius(tags, lat, lon, radius)
// 		.subscribe((response) => {
// 			let items = [];
// 			let geo = {};
// 			geo["type"] = "FeatureCollection";
// 			geo["features"] = [];
// 			// console.log(response.elements);

// 			items.push(...response.elements);
// 			items.forEach((item) => {
// 				geo["features"].push(toFeature(item));
// 			});
// 			// console.log(geo);
// 			const geoJSONcontent = geo;
// 		});
// }

/**
 * helper function to convert the features from OSM to object and pass them to the overpass frontend api
 * @param {*} arr
 * @returns
 */

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

function removeLayers(arr) {
  arr.forEach((layer) => {
    const removedMarkers = Array.from(document.querySelectorAll(`.${layer}`));
    for (const item of removedMarkers) {
      item.style.display = "none";
    }
  });
}

const featuresForm = document.querySelector("form.features");
let activeFeatureItems = [];
let featureNames = [];

const inactiveLayers = [];
const activeLayersNames = [];

featuresForm.addEventListener("change", (e) => {
  // if (!e.target.checked) return;

  const featureType = e.target.getAttribute("name");

  if (e.target.checked) {
    //console.log("item checked:", featureType);
    activeFeatureItems.length = 0;
    activeFeatureItems = tagsToObjects(definitions[featureType]);

    activeFeatureItems.forEach((item, index) => {
      const featureName = Object.values(item)[0][0];

      featureNames.length = 0;
      featureNames.push(featureName);

      const interval = 5000;
      setTimeout(() => {
        // console.log(featureName);
        // map.zoomTo(15, {
        // 	duration: 2000,
        // 	offset: [100, 50],
        // });
        getAmenitiesByBbox(item);
      }, index * interval);
    });

    for (const item of activeFeatureItems) {
      // biome-ignore lint/style/useConst: need to be blank
      let name;
      name = `layer_${Object.keys(item)}_${Object.values(item)}`;
      activeLayersNames.push(name);
    }

    // console.log("active feature items:", activeFeatureItems);
    // console.log("active layers:", activeLayersNames);
  } else {
    const removedItemObj = tagsToObjects(definitions[featureType]);
    //console.log("object unchecked:", removedItemObj);

    for (const item of removedItemObj) {
      // biome-ignore lint/style/useConst: need to be blank
      let name;
      name = `layer_${Object.keys(item)}_${Object.values(item)}`;
      inactiveLayers.push(name);
    }

    removeLayers(inactiveLayers);
  }
});

document.addEventListener("click", (e) => {
  // reset all active layers
  if (e.target.classList.contains("reset")) {
    e.preventDefault();
    const checkboxes = featuresForm.querySelectorAll('input[type="checkbox"]');
    if (!activeLayersNames.length > 0) return;
    removeLayers(activeLayersNames);
    for (const checkbox of checkboxes) {
      checkbox.checked = false;
    }
  }
  // toggle overlays elements
  if (e.target.dataset.toggle == "overlay") {
    const parent = e.target.parentNode;
    parent.classList.toggle("open");
  }
});

// map.on("zoom", function () {
//   console.log(map.getBounds());
//   console.log(map.getZoom());
// });

// const paramsObj = {
//   lat: initialPosition.lat,
//   lon: initialPosition.lon,
// };

const searchParams = new URLSearchParams(
  `lat=${initialPosition.lat}&lon=${initialPosition.lon}`,
);

window.history.replaceState({}, "", `${location.pathname}?${searchParams}`);

//console.log(document.URL);
// check this example to understand how to update the map dinamicaly
// https://maplibre.org/maplibre-gl-js/docs/examples/add-live-realtime-data/
// Update the drone symbol's location on the map
// map.getSource("drone").setData(json);
