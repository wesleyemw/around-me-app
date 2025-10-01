import maplibregl from 'maplibre-gl';
import OpacityControl from 'maplibre-gl-opacity';
import { OverpassClient } from '@andreasnicolaou/overpass-client';

const coordinates = {
    lon: -0.118092,
    lat: 51.509865
}

const map = new maplibregl.Map({
    container: 'map', // container id
    style: {
        version: 8,
        sources: {
            o_std: {
                type: 'raster',
                tiles: [
                    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                ],
                tileSize: 256,
            },
        },
        layers: [
            {
                id: 'o_std',
                type: 'raster',
                source: 'o_std',
                minzoom: 0,
                maxzoom: 18,
            },
        ],
    },
    // london starting position
    center: [coordinates.lon, coordinates.lat],
    zoom: 10,
});

map.on('load', function () {

    getAmenities(coordinates.lat, coordinates.lon);
    // MIERUNE Color
    map.addSource('m_color', {
        type: 'raster',
        tiles: ['https://tile.mierune.co.jp/mierune/{z}/{x}/{y}.png'],
        tileSize: 256,
    });
    map.addLayer({
        id: 'm_color',
        type: 'raster',
        source: 'm_color',
        minzoom: 0,
        maxzoom: 18,
    });

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
    map.addSource('t_pale', {
        type: 'raster',
        tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],
        tileSize: 256,
    });
    map.addLayer({
        id: 't_pale',
        type: 'raster',
        source: 't_pale',
        minzoom: 0,
        maxzoom: 18,
    });

    // GSI Ort
    map.addSource('t_ort', {
        type: 'raster',
        tiles: ['https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg'],
        tileSize: 256,
    });
    map.addLayer({
        id: 't_ort',
        type: 'raster',
        source: 't_ort',
        minzoom: 0,
        maxzoom: 18,
    });

    // BaseLayer
    const mapBaseLayer = {
        o_std: 'Open Street Maps',
        m_color: 'MIERUNE Color',
    };

    // OverLayer
    const mapOverLayer = {
        t_pale: 'GSI Pale',
        t_ort: 'GSI Ort',
    };

    // OpacityControl
    let Opacity = new OpacityControl({
        baseLayers: mapBaseLayer,
        overLayers: mapOverLayer,
        opacityControl: true,
    });
    map.addControl(Opacity, 'bottom-left');

    // NavigationControl
    let nc = new maplibregl.NavigationControl();
    map.addControl(nc, 'top-left');

    // Add geolocate control to the map.
    let locate = new maplibregl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: false
        })
    map.addControl(locate);

    locate.on('geolocate', (e)=> {
        getAmenities(e.coords.latitude, e.coords.longitude)
    })


    // reverse geocoding
    // fetch('https://photon.komoot.io/reverse?lon=-0.11&lat=51')
    //     .then(res => res.json())
    //     .then((geojson) => {
    //         console.log(geojson);
    //         map.addSource('reverse', {
    //             type: 'geojson',
    //             data: geojson
    //         });

    //         map.addLayer({
    //             id: "reverse_points",
    //             type: 'circle',
    //             source: 'reverse',
    //             paint: {
    //                 'circle-radius': 4,
    //                 'circle-stroke-width': 2,
    //                 'circle-color': 'red',
    //                 'circle-stroke-color': 'white'
    //             }
    //         });
    //     })


    
});


function getAmenities(lat, lon) {
    const overpassClient = new OverpassClient(); 
    const tags = { 
        amenity: ['restaurant', 'cafe']
     };
    const radius = 500;
    overpassClient.getElementsByRadius(tags, lat, lon, radius).subscribe((response) => {
        console.log(response.elements);
    });
}   


