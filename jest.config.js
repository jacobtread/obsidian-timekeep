
const { pathsToModuleNameMapper, JestConfigWithTsJest } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleDirectories: ["node_modules", "<rootDir>"],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths)
};