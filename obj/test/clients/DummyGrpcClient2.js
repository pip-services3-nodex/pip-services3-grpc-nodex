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
exports.DummyGrpcClient2 = void 0;
let _ = require('lodash');
let services = require('../../../test/protos/dummies_grpc_pb');
let messages = require('../../../test/protos/dummies_pb');
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const GrpcClient_1 = require("../../src/clients/GrpcClient");
class DummyGrpcClient2 extends GrpcClient_1.GrpcClient {
    constructor() {
        super(services.DummiesClient);
    }
    getDummies(correlationId, filter, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            paging = paging || new pip_services3_commons_nodex_2.PagingParams();
            let pagingParams = new messages.PagingParams();
            pagingParams.setSkip(paging.skip);
            pagingParams.setTake(paging.take);
            pagingParams.setTotal(paging.total);
            let request = new messages.DummiesPageRequest();
            request.setPaging(pagingParams);
            filter = filter || new pip_services3_commons_nodex_1.FilterParams();
            let filterParams = request.getFilterMap();
            for (let propName in filter) {
                if (filter.hasOwnProperty(propName)) {
                    filterParams[propName] = filter[propName];
                }
            }
            this.instrument(correlationId, 'dummy.get_page_by_filter');
            let result = yield this.call('get_dummies', correlationId, request);
            result = result != null ? result.toObject() : null;
            if (result) {
                result.data = result.dataList;
                delete result.dataList;
            }
            return result;
        });
    }
    getDummyById(correlationId, dummyId) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = new messages.DummyIdRequest();
            request.setDummyId(dummyId);
            this.instrument(correlationId, 'dummy.get_one_by_id');
            let result = yield this.call('get_dummy_by_id', correlationId, request);
            result = result != null ? result.toObject() : null;
            if (result && result.id == "" && result.key == "") {
                result = null;
            }
            return result;
        });
    }
    createDummy(correlationId, dummy) {
        return __awaiter(this, void 0, void 0, function* () {
            let dummyObj = new messages.Dummy();
            dummyObj.setId(dummy.id);
            dummyObj.setKey(dummy.key);
            dummyObj.setContent(dummy.content);
            let request = new messages.DummyObjectRequest();
            request.setDummy(dummyObj);
            this.instrument(correlationId, 'dummy.create');
            let result = yield this.call('create_dummy', correlationId, request);
            result = result != null ? result.toObject() : null;
            if (result && result.id == "" && result.key == "") {
                result = null;
            }
            return result;
        });
    }
    updateDummy(correlationId, dummy) {
        return __awaiter(this, void 0, void 0, function* () {
            let dummyObj = new messages.Dummy();
            dummyObj.setId(dummy.id);
            dummyObj.setKey(dummy.key);
            dummyObj.setContent(dummy.content);
            let request = new messages.DummyObjectRequest();
            request.setDummy(dummyObj);
            this.instrument(correlationId, 'dummy.update');
            let result = yield this.call('update_dummy', correlationId, request);
            result = result != null ? result.toObject() : null;
            if (result && result.id == "" && result.key == "") {
                result = null;
            }
            return result;
        });
    }
    deleteDummy(correlationId, dummyId) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = new messages.DummyIdRequest();
            request.setDummyId(dummyId);
            this.instrument(correlationId, 'dummy.delete_by_id');
            let result = yield this.call('delete_dummy_by_id', correlationId, request);
            result = result != null ? result.toObject() : null;
            if (result && result.id == "" && result.key == "") {
                result = null;
            }
            return result;
        });
    }
}
exports.DummyGrpcClient2 = DummyGrpcClient2;
//# sourceMappingURL=DummyGrpcClient2.js.map