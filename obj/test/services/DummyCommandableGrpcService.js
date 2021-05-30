"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyCommandableGrpcService = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const CommandableGrpcService_1 = require("../../src/services/CommandableGrpcService");
class DummyCommandableGrpcService extends CommandableGrpcService_1.CommandableGrpcService {
    constructor() {
        super('dummy');
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor('pip-services-dummies', 'controller', 'default', '*', '*'));
    }
}
exports.DummyCommandableGrpcService = DummyCommandableGrpcService;
//# sourceMappingURL=DummyCommandableGrpcService.js.map