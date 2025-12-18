// const food = [
//             'amenity=bar',
//             'amenity=cafe',
//             'amenity=fast_food',
//             'amenity=food_court',
//             'amenity=ice_cream',
//             'amenity=restaurant',
//             'shop=bakery',
//             'shop=pastry',
//             'shop=confectionery',
//             'shop=chocolate',
//              'shop=supermarket',
//               'shop=convenience' ,
//                'shop=greengrocer'
//     ];
// const transport = [
//             'amenity=bicycle_parking',
//             'amenity=bus_station',
//             'amenity=ferry_terminal',
//             'amenity=taxi',
//             'railway=station',
//             'aerialway=station'
//     ];
// const utils = [
//             'shop=storage_rental',
//             'shop=tailor'
//     ]

// export {food, transport, utils}

export default {
	food: ["amenity=restaurant", "amenity=fast_food", "amenity=food_court"],
	cafe: ["amenity=cafe", "shop=bakery"],
	bar: ["amenity=bar"],
	dessert: [
		"amenity=ice_cream",
		"shop=confectionery",
		"shop=chocolate",
		"shop=pastry",
	],
	groceries: [
		"shop=supermarket",
		"shop=greengrocer",
		"shop=convenience",
		"amenity=marketplace",
	],
	rail: ["railway=station", "station=subway"],
	tram: ["railway=tram_stop"],
	bus: ["amenity=bus_station", "highway=bus_stop"],
	otherTransport: ["amenity=ferry_terminal", "aerialway=station"],
	utils: ["shop=storage_rental", "amenity=toilets", "amenity=internet_cafe"],
	healthcare: ["amenity=pharmacy", "amenity=hospital"],
};
