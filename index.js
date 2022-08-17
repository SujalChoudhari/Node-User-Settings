/**
 * MIT License

Copyright (c) 2022 Noah

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use-strict";

const path = require("path");
const fsp = require("fs/promises");
const fs = require("fs");

/**
 * @param {*} config the configuration to be used in initialization
 * @returns the required APIs
 */
module.exports = function (config) {
  let { preferenceFileDir } = config;
  defPreferenceFilePath = path.join(preferenceFileDir, "Settings.json");

  // check arguments so that there is no error thrown at runtime
  function checkArgs(...args) {
    args.forEach((arg) => {
      if (arg && !args instanceof String) {
        throw new Error(`${arg} must be a String`);
      }
    });
  }

  const getDefaultPreferenceFilePath = () => defPreferenceFilePath;

  // read the preference file from disk and then return an object representation of the file
  async function getPreferences(prefFileName) {
    checkArgs(prefFileName);
    let fileName = prefFileName ? path.join(preferenceFileDir, prefFileName) : defPreferenceFilePath;

    try {
      let data = await fsp.readFile(fileName, "utf8");
      return JSON.parse(data);
    } catch (err) {
      return createPrefFile();
    }

    async function createPrefFile() {
      try {
        await fsp.open(fileName, "wx");
        fsp.writeFile(fileName, "{}");
      } catch (err) {
        if (err.code === "EEXIST") return;
        else if (err.code === "ENOENT") createPrefDirectory(fileName);
        else console.log(err.code);
      }

      async function createPrefDirectory() {
        try {
          return await fsp.mkdir(preferenceFileDir, {
            recursive: true
          });
        } catch (err) {
          console.log("Error while creating file directory");
        }
      }

      return {};
    }
  }

  // read the preference file from disk and then return an object representation of the file
  function getPreferencesSync(prefFileName) {
    checkArgs(prefFileName);
    let fileName = prefFileName ? path.join(preferenceFileDir, prefFileName) : defPreferenceFilePath;

    try {
      let data = fs.readFileSync(fileName, "utf8");
      return JSON.parse(data);
    } catch (err) {
      return createPrefFileSync();
    }

    function createPrefFileSync() {
      if (fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, {});
        return {};
      } else {
        createPrefDirectorySync(fileName);
      }

      function createPrefDirectorySync() {
        return fs.mkdirSync(preferenceFileDir, {
          recursive: true
        });
      }
    }
  }

  // writes to file, the specific pref specified by *pref*
  async function setPreferences(pref, prefFileName) {
    checkArgs(pref, prefFileName);
    let fileName = prefFileName ? path.join(preferenceFileDir, prefFileName) : defPreferenceFilePath;

    const preference = JSON.stringify(pref);
    try {
      await fsp.writeFile(fileName, preference);
      return true;
    } catch (err) {
      console.error(`An error occurred while writing file: ${err}`);
      return false;
    }
  }

  // writes to file, the specific pref specified by *pref*
  function setPreferencesSync(pref, prefFileName) {
    checkArgs(pref, prefFileName);
    let fileName = prefFileName ? path.join(preferenceFileDir, prefFileName) : defPreferenceFilePath;

    const preference = JSON.stringify(pref);
    try {
      fs.writeFileSync(fileName, preference);
      return true;
    } catch (err) {
      console.error(`An error occurred while writing file: ${err}`);
      return false;
    }
  }

  /**
   * Checks if the key specified by *key* is present in app preference
   *
   * @param key the key to check it's existence
   */
  async function hasKey(key, prefFileName) {
    checkArgs(key, prefFileName);
    // check if object has property key
    let dataOB = await getPreferences(prefFileName);
    for (let pref in dataOB) {
      if (pref === key) return true;
    }

    return false;
  }

  function hasSync(key, prefFileName) {
    checkArgs(key, prefFileName);
    // check if object has property key
    let dataOB = getPreferencesSync(prefFileName);
    for (let pref in dataOB) {
      if (pref === key) return true;
    }

    return false;
  }

  /**
   * Retrieves the state of a user preference using a key-value pair
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} defaultValue the default value to be retrieved if that key has never been set
   */
  function getStatesSync(key, defaultValue, prefFileName) {
    checkArgs(key, prefFileName);
    // first check if key exists
    if (hasKey(key, prefFileName)) {
      const dataOB = getPreferencesSync(prefFileName);
      return `${dataOB[`${key}`]}`;
    } else return `${defaultValue}`;
  }

  /**
   * Retrieves the state of a user preference using a key-value pair
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} defaultValue the default value to be retrieved if that key has never been set
   * @returns a Promises that resolves to the value set previously or just resolves to the default value
   */
  function getState(key, defaultValue, prefFileName) {
    return new Promise(async (resolve, _reject) => {
      checkArgs(key, prefFileName);
      // first check if key exists
      if (hasKey(key, prefFileName)) {
        const dataOB = await getPreferences(prefFileName);
        resolve(`${dataOB[`${key}`]}`);
      } else resolve(`${defaultValue}`);
    });
  }

  /**
   * Retrieves the state of a user preference using a key-value pair
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} defaultValue the default value to be retrieved if that key has never been set
   * @returns a Promises that resolves to the values set previously or just resolves to an empty array
   */
  async function getStates(states, prefFileName) {
    return new Promise(async (resolve, reject) => {
      checkArgs(prefFileName);
      if (!states instanceof Array) {
        reject(new Error("states must be a qualified Array object"));
      }
      const dataOB = await getPreferences(prefFileName);
      let values = [];
      for (let key of states) {
        // first check if key exists
        if (hasKey(key, prefFileName)) {
          values.push(`${dataOB[`${key}`]}`);
        } else {
          values.push(null);
        }
      }
      resolve(values);
    });
  }

  /**
   * Sets the state of a user preference using a key-value pair
   * Note: A new key would be created after this request
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} value the value to be set
   */
  function setStateSync(key, value, prefFileName) {
    checkArgs(key, prefFileName);
    let pref = getPreferencesSync(prefFileName);
    pref[`${key}`] = `${value}`;
    return setPreferencesSync(pref);
  }

  /**
   * Sets the state of a user preference using a key-value pair
   * Note: A new key would be created after this request
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} value the value to be set
   */
  async function setState(key, value, prefFileName) {
    return new Promise(async (resolve, _reject) => {
      checkArgs(key, prefFileName);
      let pref = await getPreferences(prefFileName);
      pref[`${key}`] = `${value}`;
      resolve(setPreferences(pref));
    });
  }

  /**
   * Sets the states of a user preference using a JSON object containing key-value pairs
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param states an object representing the states to be synched
   * @returns the number of staes that was saved
   */
  function setStates(states, prefFileName) {
    return new Promise(async (resolve, reject) => {
      let inserted = [];
      checkArgs(prefFileName);
      if (!states instanceof Object) {
        reject("states must be a qualified JSON object");
      }
      let pref = await getPreferences(prefFileName);
      Object.keys(states).forEach((key) => {
        pref[`${key}`] = `${states[`${key}`]}`;
        inserted.push(pref[`${key}`]);
      });

      setPreferences(pref);
      resolve(inserted);
    });
  }

  /**
   * Sets the states of a user preference using a JSON object containing key-value pairs
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param states an object representing the states to be synched
   * @returns the number of staes that was saved
   */
  function setStateSync(states, prefFileName) {
    return new Promise(async (resolve, reject) => {
      let inserted = [];
      checkArgs(prefFileName);
      if (!states instanceof Object) {
        reject("states must be a qualified JSON object");
      }
      let pref = await getPreferences(prefFileName);
      Object.keys(states).forEach((key) => {
        pref[`${key}`] = `${states[`${key}`]}`;
        inserted.push(pref[`${key}`]);
      });

      setPreferences(pref);
      resolve(inserted);
    });
  }

  /**
 * Removes a preference value from settings if it exists
 * Note: Trying to use *getState()* would just return the default arg set
 
 * @param {*} key the key in settings that would be deleted
 */
  async function deleteKey(key, prefFileName) {
    checkArgs(key, prefFileName);
    let pref = await getPreferences();
    // check if key is present in prefs
    if (hasKey(key, prefFileName)) {
      delete pref[`${key}`];
    } else {
      // nothing was deleted, but still return true
      return true;
    }

    return setPreferences(pref);
  }

  /**
 * Removes a preference value from settings if it exists
 * Note: Trying to use *getState()* would just return the default arg set
 
 * @param {*} key the key in settings that would be deleted
 */
  function deleteKeySync(key, prefFileName) {
    checkArgs(key, prefFileName);
    let pref = getPreferencesSync();
    // check if key is present in prefs
    if (hasKeySync(key, prefFileName)) {
      delete pref[`${key}`];
    } else {
      // nothing was deleted, but still return true
      return true;
    }

    return setPreferencesSync(pref);
  }

  return { getDefaultPreferenceFilePath, getState, getStates, setState, setStates };
};
