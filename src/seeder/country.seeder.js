// const countryData = require('../../country_data.json');
// const { errorColor, successColor } = require('../helper/color.helper');
// const { str2regex } = require('../helper/function.helper');
// const { State, City, Country } = require('../models');

// /** Generate countries, states and cities name slug by names */
// const generateCountrySlug = (str) => {
//     return str
//         .toLowerCase()
//         .replace(/ /g, '-')
//         .replace(/[\\/]/g, '-')
//         .replace(/[&\\#[\],+()$~%.`'":*?<>{}]/g, '')
//         .replace(/-+/g, '-');
// };

// /** Country seeder */
// module.exports = countrySeeder = async () => {
//     try {
//         for (const country of countryData) {
//             let countrySlug = await generateCountrySlug(country.country_name);
//             const countryExists = await Country.findOne({
//                 country_slug: { $regex: '^' + str2regex(countrySlug) + '$', $options: 'i' },
//                 iso3: country.iso3_code,
//             });

//             if (!countryExists) {
//                 const newCountry = await Country.create({
//                     country_name: country.country_name,
//                     iso3: country.iso3_code,
//                     flag_emoji: country.flag,
//                     country_slug: countrySlug,
//                 });

//                 for (let i = 0; i < country.states?.length; i++) {
//                     const newState = await State.create({
//                         name: country.states[i].name,
//                         slug: await generateCountrySlug(country.states[i].name),
//                         state_code: country.states[i].state_code,
//                         country: newCountry._id,
//                     });

//                     if (country.states[i]?.cities.length) {
//                         let cities = [];

//                         for (let j = 0; j < country.states[i]?.cities.length; j++) {
//                             cities.push({
//                                 name: country.states[i].cities[j].name,
//                                 slug: await generateCountrySlug(country.states[i].cities[j].name),
//                                 state: newState._id,
//                             });
//                         }
//                         await City.insertMany(cities);
//                     }
//                 }
//             } else {
//                 for (let i = 0; i < country.states?.length; i++) {
//                     const stateExists = await State.findOne({
//                         slug: await generateCountrySlug(country.states[i].name),
//                         state_code: country.states[i].state_code,
//                     });
//                     if (!stateExists) {
//                         const newState = await State.create({
//                             name: country.states[i].name,
//                             slug: await generateCountrySlug(country.states[i].name),
//                             state_code: country.states[i].state_code,
//                             country: countryExists._id,
//                         });

//                         if (country.states[i]?.cities.length) {
//                             let cities = [];

//                             for (let j = 0; j < country.states[i]?.cities.length; j++) {
//                                 cities.push({
//                                     name: country.states[i].cities[j].name,
//                                     slug: await generateCountrySlug(
//                                         country.states[i].cities[j].name
//                                     ),
//                                     state: newState._id,
//                                     country: countryExists._id,
//                                 });
//                             }
//                             await City.insertMany(cities);
//                         }
//                     } else {
//                         let cities = [];
//                         for (let k = 0; k < country.states[i]?.cities.length; k++) {
//                             const citySlug = await generateCountrySlug(
//                                 country.states[i].cities[k].name
//                             );
//                             const cityExists = await City.findOne({
//                                 slug: citySlug,
//                                 state: stateExists._id,
//                             });
//                             if (!cityExists) {
//                                 cities.push({
//                                     name: country.states[i].cities[k].name,
//                                     slug: citySlug,
//                                     state: stateExists._id,
//                                     country: countryExists._id,
//                                 });
//                             }
//                         }

//                         await City.insertMany(cities);
//                     }
//                 }
//             }
//         }

//         console.log(successColor, '✅ Country, state and city seeded successfully...');
//     } catch (error) {
//         console.log(errorColor, '❌ Error from country seeder: ', error);
//     }
// };
