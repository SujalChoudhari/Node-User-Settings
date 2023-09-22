"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

settings.setState_c("name", "Noah", null, (_err, isSet) => {
  console.log(`is value set? ${isSet}`);
});

const optionalFilename = "user-settings.json";

settings.setState_c("name", "Wesley", optionalFilename, (_err, isSet) => {
  console.log(`is value set? ${isSet}`);
});
