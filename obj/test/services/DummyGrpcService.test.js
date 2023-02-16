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
const assert = require('chai').assert;
const grpc = require('@grpc/grpc-js');
const services = require('../../../test/protos/dummies_grpc_pb');
const messages = require('../../../test/protos/dummies_pb');
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const DummyController_1 = require("../DummyController");
const DummyGrpcService_1 = require("./DummyGrpcService");
let grpcConfig = pip_services3_commons_nodex_2.ConfigParams.fromTuples("connection.protocol", "http", "connection.host", "localhost", "connection.port", 3000);
suite('DummyGrpcService', () => {
    let _dummy1;
    let _dummy2;
    let service;
    let client;
    suiteSetup(() => __awaiter(void 0, void 0, void 0, function* () {
        let ctrl = new DummyController_1.DummyController();
        service = new DummyGrpcService_1.DummyGrpcService();
        service.configure(grpcConfig);
        let references = pip_services3_commons_nodex_3.References.fromTuples(new pip_services3_commons_nodex_1.Descriptor('pip-services-dummies', 'controller', 'default', 'default', '1.0'), ctrl, new pip_services3_commons_nodex_1.Descriptor('pip-services-dummies', 'service', 'grpc', 'default', '1.0'), service);
        service.setReferences(references);
        yield service.open(null);
    }));
    suiteTeardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield service.close(null);
    }));
    setup(() => {
        client = new services.DummiesClient('localhost:3000', grpc.credentials.createInsecure());
        _dummy1 = { id: null, key: "Key 1", content: "Content 1" };
        _dummy2 = { id: null, key: "Key 2", content: "Content 2" };
    });
    test('CRUD Operations', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create one dummy
        let dummy = new messages.Dummy();
        dummy.setId(_dummy1.id);
        dummy.setKey(_dummy1.key);
        dummy.setContent(_dummy1.content);
        let request = new messages.DummyObjectRequest();
        request.setDummy(dummy);
        dummy = yield new Promise((resolve, reject) => {
            client.create_dummy(request, (err, dummy) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummy);
            });
        });
        dummy = dummy.toObject();
        assert.isObject(dummy);
        assert.equal(dummy.content, _dummy1.content);
        assert.equal(dummy.key, _dummy1.key);
        let dummy1 = dummy;
        // Create another dummy
        dummy = new messages.Dummy();
        dummy.setId(_dummy2.id);
        dummy.setKey(_dummy2.key);
        dummy.setContent(_dummy2.content);
        request = new messages.DummyObjectRequest();
        request.setDummy(dummy);
        dummy = yield new Promise((resolve, reject) => {
            client.create_dummy(request, (err, dummy) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummy);
            });
        });
        dummy = dummy.toObject();
        assert.isObject(dummy);
        assert.equal(dummy.content, _dummy2.content);
        assert.equal(dummy.key, _dummy2.key);
        // Get all dummies
        request = new messages.DummiesPageRequest();
        let dummies = yield new Promise((resolve, reject) => {
            client.get_dummies(request, (err, dummies) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummies);
            });
        });
        dummies = dummies.toObject();
        assert.isObject(dummies);
        assert.lengthOf(dummies.dataList, 2);
        // Update the dummy
        dummy1.content = 'Updated Content 1';
        dummy = new messages.Dummy();
        dummy.setId(dummy1.id);
        dummy.setKey(dummy1.key);
        dummy.setContent(dummy1.content);
        request = new messages.DummyObjectRequest();
        request.setDummy(dummy);
        dummy = yield new Promise((resolve, reject) => {
            client.update_dummy(request, (err, dummy) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummy);
            });
        });
        dummy = dummy.toObject();
        assert.isObject(dummy);
        assert.equal(dummy.content, 'Updated Content 1');
        assert.equal(dummy.key, _dummy1.key);
        dummy1 = dummy;
        // Delete dummy
        request = new messages.DummyIdRequest();
        request.setDummyId(dummy1.id);
        dummy = yield new Promise((resolve, reject) => {
            client.delete_dummy_by_id(request, (err, dummy) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummy);
            });
        });
        // Try to get delete dummy
        request = new messages.DummyIdRequest();
        request.setDummyId(dummy1.id);
        dummy = yield new Promise((resolve, reject) => {
            client.get_dummy_by_id(request, (err, dummy) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummy);
            });
        });
        // assert.isObject(dummy);
    }));
});
//# sourceMappingURL=DummyGrpcService.test.js.map