function toFeature(obj) {
  if (obj.type === "node") {
    const newFeature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(obj.lon), parseFloat(obj.lat)],
      },
      properties: {
        id: obj.id,
        ...obj.tags,
      },
    };

    return newFeature;
  } else if (obj.type === "way") {
    const newFeature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(obj.center.lon), parseFloat(obj.center.lat)],
      },
      properties: {
        id: obj.id,
        ...obj.tags,
      },
    };
    return newFeature;
  }
}

export { toFeature };
