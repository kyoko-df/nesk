"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_method_enum_1 = require("@neskjs/common/enums/request-method.enum");
exports.ModuleInitMessage = (module) => `${module} dependencies initialized`;
exports.RouteMappedMessage = (path, method) => `Mapped {${path}, ${request_method_enum_1.RequestMethod[method]}} route`;
exports.ControllerMappingMessage = (name, path) => `${name} {${path}}:`;
