const fs = require('fs');
const crypto = require('crypto');
const momentTimeZone = require('moment-timezone');

/************************************ Generate response/error message function ****************************************************/
const validationFile = require('../config/validation.json');
const attributesFile = require('../config/attributes.json');

/**
 * Generate response/error message.
 * @param {Object} req
 * @param {String} validation
 * @param {String} attribute
 * @returns
 */
const generateMessage = (validation, attribute) => {
  let message = '';

  if (!validationFile[validation] || !attributesFile[attribute]) {
    /**
     * Data add in missing file.
     * @param {String} filePath
     * @param {String} data
     */
    const appendDataInMissingFile = (filePath, data) => {
      let fileData = { [data]: data };

      if (fs.existsSync(filePath)) {
        let file = fs.readFileSync(filePath, 'utf8');
        fileData = { ...JSON.parse(file), ...fileData };
      } // If the file exists, the file data is merged with the new data.

      fs.writeFileSync(filePath, JSON.stringify(fileData)); // Create or append data to a file.
    };

    if (!validationFile[validation]) {
      appendDataInMissingFile('./src/config/validation.missing.json', validation); // If validation doesn't exist in validationFile, validation add in validation.missing.json file.
    }

    if (!attributesFile[attribute]) {
      appendDataInMissingFile('./src/config/attribute.missing.json', attribute);
    } // If attribute doesn't exist in attributesFile, attribute add in attribute.missing.json file.

    message = validation;
  }

  if (validationFile[validation]) {
    message = validationFile[validation].replace('{{attribute}}', attributesFile[attribute] ?? attribute);
  } // If validation exist in validationFile,replace attribute to validation of attribute.

  return message;
};
/*********************************************************************************************************************************/

/**
 * The search string is converted to a regex string.
 * @param {String} searchStr
 * @returns
 */
const str2regex = (searchStr) => {
  const regexStr = searchStr.split(''); // Search string split (convert in array)

  regexStr.forEach((ele, ind) => {
    if (['.', '+', '*', '?', '^', '$', '(', ')', '[', ']', '{', '}', '|', '\\'].find((e) => ele === e))
      regexStr[ind] = `\\${regexStr[ind]}`;
  });

  return regexStr.join('');
};

/**
 * Generate slug.
 * @param {*} str
 * @returns
 */
const generateSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/ /g, '-')
    .replace(/&/g, 'and')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '-');
};

/**
 * capitalize the string
 * @param {String} str
 * @returns {Promise<String>}
 */
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Generate password string
 * @returns {Promise<String>}
 */
const generatePassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialCharacters = '@#$&%!';

  let password = '';

  password += upper.charAt(Math.floor(Math.random() * upper.length)); // Add one random upper letter.

  password += lower.charAt(Math.floor(Math.random() * lower.length)); // Add one random lower letter.

  password += numbers.charAt(Math.floor(Math.random() * numbers.length)); // Add one random number.

  password += specialCharacters.charAt(Math.floor(Math.random() * specialCharacters.length)); // Add one random special characters.

  const combinedChars = upper + lower + numbers + specialCharacters;

  // Fill the remaining characters with a mix of letters and numbers.
  for (let i = 0; i < 6; i++) {
    password += combinedChars.charAt(Math.floor(Math.random() * combinedChars.length));
  }

  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join(''); // Shuffle the password characters randomly
};

/**
 * Create an object composed of the picked object properties
 * @param {Array} arrayValue
 * @param {string[]} keys
 * @returns {Array}
 */
const arrayPick = (arrayValue, keys) => {
  const newArray = [];
  for (const val of arrayValue) {
    const newObj = {};
    for (const key of keys) {
      if (key in val) newObj[key] = val[key];
    }
    newArray.push(newObj);
  }
  return { results: newArray };
};

/**
 * Get weeks between two dates
 * @param {Date} cuD
 * @param {Date} enD
 * @returns {Number}
 */
const weeksBetween = (cuD, enD) => {
  // Current Date and Entered Date
  return Math.round((enD - cuD) / (7 * 24 * 60 * 60 * 1000));
};

/**
 * Encrypt the confidential value
 * @param {string} text The value which you want to encrypt.
 * @param {string} key The secret key which made by you. You can pass any string for secret key but keep it in mind that which secret key you used for encrypt the secret key is also used for decrypt
 * @returns The encrypted value
 */
const encryptString = (text, key) => {
  const cipher = crypto.Cipher('aes-256-cbc', key);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

/**
 * Decrypt the encrypted value
 * @param {string} encrypted Pass encrypted string value
 * @param {string} key Pass secret key which you used for encrypt the value
 * @returns The original value which encrypted by you.
 */
const decryptString = (encrypted, key) => {
  const decipher = crypto.Decipher('aes-256-cbc', key);
  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};

const timeStringToWeekTime = (timeString) => {
  const result = [];

  const daysMapping = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday',
  };

  const parseTimeRange = (timeRange) => {
    const parts = timeRange.split(/\s+/);
    const openTime = momentTimeZone
      .tz(parts[3] + ' ' + parts[4], 'hh:mm a', 'Asia/Kolkata')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    const closeTime = momentTimeZone
      .tz(parts[6] + ' ' + parts[7], 'hh:mm a', 'Asia/Kolkata')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

    return {
      open_time: new Date(openTime),
      close_time: new Date(closeTime),
      type: 'open',
    };
  };

  const singleDayParseTimeRange = (dayTimeRange) => {
    const parts = dayTimeRange.split(/\s+/);
    const openTime = momentTimeZone
      .tz(parts[1] + ' ' + parts[2], 'hh:mm a', 'Asia/Kolkata')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    const closeTime = momentTimeZone
      .tz(parts[4] + ' ' + parts[5], 'hh:mm a', 'Asia/Kolkata')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

    return {
      open_time: new Date(openTime),
      close_time: new Date(closeTime),
      type: 'open',
    };
  };

  const matchDaysRangeTime = timeString.match(/([a-zA-Z]+) - ([a-zA-Z]+) (\d{1,2}:\d{2} [apm]+) - (\d{1,2}:\d{2} [apm]+)/g);
  const matchDayTime = matchDaysRangeTime
    ? timeString.split(matchDaysRangeTime[0])[1].match(/([a-zA-Z]+) (\d{1,2}:\d{2} [apm]+) - (\d{1,2}:\d{2} [apm]+)/g)
    : timeString.match(/([a-zA-Z]+) (\d{1,2}:\d{2} [apm]+) - (\d{1,2}:\d{2} [apm]+)/g);

  if (matchDaysRangeTime) {
    for (const day in daysMapping) {
      const currentDayIndex = Object.values(daysMapping).indexOf(daysMapping[day]);
      const dayRange = matchDaysRangeTime[0].match(/([a-zA-Z]+) - ([a-zA-Z]+) /g)[0].split('-');
      const startDayRangeIndex = Object.values(daysMapping).indexOf(daysMapping[dayRange[0].trim()]);
      const endDayRangeIndex = Object.values(daysMapping).indexOf(daysMapping[dayRange[1].trim()]);

      if (currentDayIndex >= startDayRangeIndex && currentDayIndex <= endDayRangeIndex) {
        const dayObject = {
          day: daysMapping[day],
          ...parseTimeRange(matchDaysRangeTime[0]),
        };
        result.push(dayObject);
      } else {
        if (matchDayTime && !matchDayTime[0].toLowerCase().includes('closed')) {
          const dayObject = {
            day: daysMapping[day],
            ...singleDayParseTimeRange(matchDayTime[0]),
          };
          result.push(dayObject);
        } else {
          result.push({
            day: daysMapping[day],
            open_time: null,
            close_time: null,
            type: 'closed',
          });
        }
      }
    }
  } else if (matchDayTime) {
    for (const day in daysMapping) {
      const currentDayIndex = Object.values(daysMapping).indexOf(daysMapping[day]);
      const dayIndex = Object.values(daysMapping).indexOf(daysMapping[matchDayTime[0].match(/([a-zA-Z]+) /g)[0].trim()]);
      if (currentDayIndex === dayIndex) {
        const dayObject = {
          day: daysMapping[day],
          ...singleDayParseTimeRange(matchDayTime[0]),
        };
        result.push(dayObject);
      } else {
        result.push({
          day: daysMapping[day],
          open_time: null,
          close_time: null,
          type: 'closed',
        });
      }
    }
  }
  return result;
};

/**
 * Convert number into readable number
 * @param {number} num
 * @returns
 */
const readableNumber = (num) => {
  if (num >= 1000000000) {
    return parseFloat((num / 1000000000).toFixed(1)) + 'B';
  } else if (num >= 1000000) {
    return parseFloat((num / 1000000).toFixed(1)) + 'M';
  } else if (num >= 1000) {
    return parseFloat((num / 1000).toFixed(1)) + 'K';
  } else {
    return num.toString();
  }
};

/**
 * Create a compare slug from breed slug
 * @param {[object]} breeds
 * @returns
 */
const pairSlugOfBreeds = (breeds) => {
  const breedPairs = [];

  for (let i = 0; i < breeds.length; i++) {
    let firstBreedSlug = breeds[i].slug;
    for (let j = i + 1; j < breeds.length; j++) {
      let secondBreedSlug = breeds[j].slug;

      breedPairs.push(`${firstBreedSlug}-and-${secondBreedSlug}`);
    }
  }

  return breedPairs;
};

/** Get youtube video id from video link */
const getYouTubeVideoId = (url) => {
  // Regular expression to extract the video ID
  const regex =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  // Use the regular expression to extract the video ID
  const match = url.match(regex);

  // Return the video ID or null if not found
  return match ? match[1] : null;
};

module.exports = {
  generateMessage,
  str2regex,
  generateSlug,
  capitalizeFirstLetter,
  generatePassword,
  arrayPick,
  weeksBetween,
  encryptString,
  decryptString,
  timeStringToWeekTime,
  readableNumber,
  pairSlugOfBreeds,
  getYouTubeVideoId,
};
