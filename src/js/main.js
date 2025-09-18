import maplibregl from 'maplibre-gl';
import OpacityControl from 'maplibre-gl-opacity';

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
    center: [-82.9833, 39.9833],
    zoom: 10,
});

map.on('load', function () {
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
});


// get current position

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function success(pos) {
  const crd = pos.coords;

  console.log("Your current position is:");
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);