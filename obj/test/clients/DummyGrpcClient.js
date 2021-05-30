"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyGrpcClient = void 0;
const GrpcClient_1 = require("../../src/clients/GrpcClient");
class DummyGrpcClient extends GrpcClient_1.GrpcClient {
    constructor() {
        super(__dirname + "../../../../test/protos/dummies.proto", "dummies.Dummies");
    }
    getDummies(correlationId, filter, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            this.instrument(correlationId, 'dummy.get_page_by_filter');
            return yield this.call('get_dummies', correlationId, {
                filter: filter,
                paging: paging
            });
        });
    }
    getDummyById(correlationId, dummyId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.instrument(correlationId, 'dummy.get_one_by_id');
            let result = yield this.call('get_dummy_by_id', correlationId, {
                dummy_id: dummyId
            });
            if (result && result.id == "" && result.key == "") {
                result = null;
            }
            return result;
        });
    }
    createDummy(correlationId, dummy) {
        return __awaiter(this, void 0, void 0, function* () {
            this.instrument(correlationId, 'dummy.create');
            let result = yield this.call('create_dummy', correlationId, {
                dummy: dummy
            });
            if (result && result.id == "" && result.key == "") {
                result = null;
            }
            return result;
        });
    }
    updateDummy(correlationId, dummy) {
        return __awaiter(this, void 0, void 0, function* () {
            this.instrument(correlationId, 'dummy.update');
            let result = yield this.call('update_dummy', correlationId, {
                dummy: dummy
            });
            if (result && result.id == "" && result.key == "") {
                result = null;
            }
            return result;
        });
    }
    deleteDummy(correlationId, dummyId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.instrument(correlationId, 'dummy.delete_by_id');
            let result = yield this.call('delete_dummy_by_id', correlationId, {
                dummy_id: dummyId
            });
            if (result && result.id == "" && result.key == "") {
                result = null;
            }
            return result;
        });
    }
}
exports.DummyGrpcClient = DummyGrpcClient;
//# sourceMappingURL=DummyGrpcClient.js.map