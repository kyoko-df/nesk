"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_service_1 = require("@neskjs/common/services/logger.service");
const nesk_environment_enum_1 = require("@neskjs/common/enums/nesk-environment.enum");
const metadata_scanner_1 = require("@neskjs/core/metadata-scanner");
const testing_module_builder_1 = require("./testing-module.builder");
class Test {
    static createTestingModule(metadata) {
        this.init();
        return new testing_module_builder_1.TestingModuleBuilder(this.metadataScanner, metadata);
    }
    static init() {
        logger_service_1.Logger.setMode(nesk_environment_enum_1.NeskEnvironment.TEST);
    }
}
Test.metadataScanner = new metadata_scanner_1.MetadataScanner();
exports.Test = Test;
