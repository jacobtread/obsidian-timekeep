const { pathsToModuleNameMapper, JestConfigWithTsJest } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    moduleDirectories: ["node_modules", "<rootDir>"],
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
};
