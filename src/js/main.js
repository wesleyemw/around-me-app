import maplibregl from "maplibre-gl";
import StyleFlipperControl from "maplibre-gl-style-flipper";

import { OverpassClient } from "@andreasnicolaou/overpass-client";
import { toFeature } from "./modules/utils";
import definitions from "./modules/definitions";

import FeatureSidebar from "./components/FeatureSidebar";

(async () => {
  // TODO: Move this to a proxy store
  window.utils = {};
  utils = {
    clickedMarker: null,
  };

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const initialPosition = {
    lon: params.lon,
    lat: params.lat,
  };

  // Define map styles
  const mapStyles = {
    "carto-positron": {
      code: "carto-positron",
      url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      image:
        "https://carto.com/help/images/building-maps/basemaps/positron_labels.png",
    },
    "carto-dark": {
      code: "carto-dark",
      url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      image:
        "https://carto.com/help/images/building-maps/basemaps/dark_labels.png",
    },
    "carto-voyager": {
      code: "carto-voyager",
      url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      image:
        "https://carto.com/help/images/building-maps/basemaps/voyager_labels.png",
    },
  };

  const map = new maplibregl.Map({
    container: "map", // container id
    style: mapStyles["carto-positron"].url, // Default style
    // paris starting position
    center: [initialPosition.lon, initialPosition.lat],
    zoom: 15.2,
  });

  map.on("load", async () => {
    // NavigationControl
    const nc = new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true,
    });
    map.addControl(nc, "top-right");

    // Create an instance of StyleFlipperControl
    const styleFlipperControl = new StyleFlipperControl(mapStyles);

    // Set the initial style code
    styleFlipperControl.setCurrentStyleCode("carto-positron");

    // Add the control to the map
    map.addControl(styleFlipperControl, "bottom-left");

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
    const bbox = map.getBounds();
    const points = {
      minLat: bbox._sw.lat,
      minLon: bbox._sw.lng,
      maxLat: bbox._ne.lat,
      maxLon: bbox._ne.lng,
    };
    const tags = tagsObj;
    const overpassClient = new OverpassClient();
    const box = [points.minLat, points.minLon, points.maxLat, points.maxLon]; // [minLat, minLon, maxLat, maxLon]
    const elements = ["node", "way"];
    overpassClient.getElementsByBoundingBox(tags, box).subscribe((response) => {
      // console.log(Object.values(tagsObj)[0][0]);
      const elementsResponse = response.elements;
      elementsResponse.forEach((item) => {
        console.log(item);
      });

      const category = Object.keys(tags)[0];
      const featureName = Object.values(tags)[0][0];
      //console.log("new layer name:", `layer_${category}_${featureName}`);

      if (response.elements.length !== 0) {
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
          el.addEventListener("click", async () => {
            // elAttribute = JSON.stringify(marker);
            window.utils.clickedMarker = await marker; // console.log(utils.clickedMarker);

            let pageElement = null;
            pageElement = document.createElement("feature-sidebar");
            const featureEl = rightPanel.querySelector("feature-sidebar");
            if (featureEl !== null) {
              rightPanel.removeChild(featureEl);
              rightPanel.appendChild(pageElement);
            } else {
              rightPanel.appendChild(pageElement);
            }

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
  const featureNames = [];

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
      const checkboxes = featuresForm.querySelectorAll(
        'input[type="checkbox"]',
      );
      if (!activeLayersNames.length > 0) return;
      removeLayers(activeLayersNames);
      for (const checkbox of checkboxes) {
        checkbox.checked = false;
      }
    }
    // toggle overlays elements
    if (e.target.dataset.toggle === "overlay") {
      const parent = e.target.parentNode;
      parent.classList.toggle("open");
    }
  });

  // document.addEventListener("DOMContentLoaded", () => {
  // });
})();

// const testZoom = () => {
//   map.on("zoom", () => {
//     const zoom = map.getZoom();
//     // store this in a config object
//     const minZoom = 15.2;
//     console.log(zoom);
//     if (zoom < minZoom) {
//       console.log("this zoom is not acceptable", zoom);
//     } else {
//       console.log("Good to go", zoom);navi
//     }
//   });
// };

// testZoom();

//console.log(document.URL);
// check this example to understand how to update the map dinamicaly
// https://maplibre.org/maplibre-gl-js/docs/examples/add-live-realtime-data/
// Update the drone symbol's location on the map
// map.getSource("drone").setData(json);
