"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

const value1 = settings.getStatesSync(["name", "version"]);

const optionalFilename = "user-settings.json";

const value2 = settings.getStatesSync(["name", "Job"], optionalFilename);

console.log("got: %s", [...value1, ...value2]);
