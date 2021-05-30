"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyCommandableGrpcClient = void 0;
const CommandableGrpcClient_1 = require("../../src/clients/CommandableGrpcClient");
class DummyCommandableGrpcClient extends CommandableGrpcClient_1.CommandableGrpcClient {
    constructor() {
        super('dummy');
    }
    getDummies(correlationId, filter, paging) {
        return this.callCommand('get_dummies', correlationId, {
            filter: filter,
            paging: paging
        });
    }
    getDummyById(correlationId, dummyId) {
        return this.callCommand('get_dummy_by_id', correlationId, {
            dummy_id: dummyId
        });
    }
    createDummy(correlationId, dummy) {
        return this.callCommand('create_dummy', correlationId, {
            dummy: dummy
        });
    }
    updateDummy(correlationId, dummy) {
        return this.callCommand('update_dummy', correlationId, {
            dummy: dummy
        });
    }
    deleteDummy(correlationId, dummyId) {
        return this.callCommand('delete_dummy', correlationId, {
            dummy_id: dummyId
        });
    }
}
exports.DummyCommandableGrpcClient = DummyCommandableGrpcClient;
//# sourceMappingURL=DummyCommandableGrpcClient.js.map