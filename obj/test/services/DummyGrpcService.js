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
exports.DummyGrpcService = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_5 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_6 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_7 = require("pip-services3-commons-nodex");
const DummySchema_1 = require("../DummySchema");
const GrpcService_1 = require("../../src/services/GrpcService");
class DummyGrpcService extends GrpcService_1.GrpcService {
    constructor() {
        super(__dirname + "../../../../test/protos/dummies.proto", "dummies.Dummies.service");
        this._numberOfCalls = 0;
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor("pip-services-dummies", "controller", "default", "*", "*"));
    }
    setReferences(references) {
        super.setReferences(references);
        this._controller = this._dependencyResolver.getOneRequired('controller');
    }
    getNumberOfCalls() {
        return this._numberOfCalls;
    }
    incrementNumberOfCalls(call, next) {
        this._numberOfCalls++;
        return next(call);
    }
    getPageByFilter(call) {
        return __awaiter(this, void 0, void 0, function* () {
            let filter = pip_services3_commons_nodex_2.FilterParams.fromValue(call.request.filter);
            let paging = pip_services3_commons_nodex_3.PagingParams.fromValue(call.request.paging);
            return yield this._controller.getPageByFilter(call.request.correlation_id, filter, paging);
        });
    }
    getOneById(call) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this._controller.getOneById(call.request.correlation_id, call.request.dummy_id);
            return result || {};
        });
    }
    create(call) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._controller.create(call.request.correlation_id, call.request.dummy);
        });
    }
    update(call) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._controller.update(call.request.correlation_id, call.request.dummy);
        });
    }
    deleteById(call) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this._controller.deleteById(call.request.correlation_id, call.request.dummy_id);
            return result || {};
        });
    }
    register() {
        this.registerInterceptor(this.incrementNumberOfCalls);
        this.registerMethod('get_dummies', new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withOptionalProperty("paging", new pip_services3_commons_nodex_4.PagingParamsSchema())
            .withOptionalProperty("filter", new pip_services3_commons_nodex_7.FilterParamsSchema()), this.getPageByFilter);
        this.registerMethod('get_dummy_by_id', new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty("dummy_id", pip_services3_commons_nodex_6.TypeCode.String), this.getOneById);
        this.registerMethod('create_dummy', new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty("dummy", new DummySchema_1.DummySchema()), this.create);
        this.registerMethod('update_dummy', new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty("dummy", new DummySchema_1.DummySchema()), this.update);
        this.registerMethod('delete_dummy_by_id', new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty("dummy_id", pip_services3_commons_nodex_6.TypeCode.String), this.deleteById);
    }
}
exports.DummyGrpcService = DummyGrpcService;
//# sourceMappingURL=DummyGrpcService.js.map