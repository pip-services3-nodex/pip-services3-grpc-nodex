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
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
let services = require('../../../src/protos/commandable_grpc_pb');
let messages = require('../../../src/protos/commandable_pb');
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const DummyController_1 = require("../DummyController");
const DummyCommandableGrpcService_1 = require("./DummyCommandableGrpcService");
let grpcConfig = pip_services3_commons_nodex_2.ConfigParams.fromTuples("connection.protocol", "http", "connection.host", "localhost", "connection.port", 3001);
suite('DummyCommandableGrpcService', () => {
    let _dummy1;
    let _dummy2;
    let service;
    let client;
    suiteSetup(() => __awaiter(void 0, void 0, void 0, function* () {
        let ctrl = new DummyController_1.DummyController();
        service = new DummyCommandableGrpcService_1.DummyCommandableGrpcService();
        service.configure(grpcConfig);
        let references = pip_services3_commons_nodex_3.References.fromTuples(new pip_services3_commons_nodex_1.Descriptor('pip-services-dummies', 'controller', 'default', 'default', '1.0'), ctrl, new pip_services3_commons_nodex_1.Descriptor('pip-services-dummies', 'service', 'grpc', 'default', '1.0'), service);
        service.setReferences(references);
        yield service.open(null);
    }));
    suiteTeardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield service.close(null);
    }));
    setup(() => {
        let packageDefinition = protoLoader.loadSync(__dirname + "../../../../src/protos/commandable.proto", {
            keepCase: true,
            // longs: String,
            // enums: String,
            defaults: true,
            oneofs: true
        });
        let clientProto = grpc.loadPackageDefinition(packageDefinition).commandable.Commandable;
        client = new clientProto('localhost:3001', grpc.credentials.createInsecure());
        _dummy1 = { id: null, key: "Key 1", content: "Content 1" };
        _dummy2 = { id: null, key: "Key 2", content: "Content 2" };
    });
    test('CRUD Operations', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create one dummy
        let response = yield new Promise((resolve, reject) => {
            client.invoke({
                method: 'dummy.create_dummy',
                args_empty: false,
                args_json: JSON.stringify({
                    dummy: _dummy1
                })
            }, (err, response) => {
                if (err != null)
                    reject(err);
                else
                    resolve(response);
            });
        });
        assert.isFalse(response.result_empty);
        assert.isString(response.result_json);
        let dummy = JSON.parse(response.result_json);
        assert.isObject(dummy);
        assert.equal(dummy.content, _dummy1.content);
        assert.equal(dummy.key, _dummy1.key);
        let dummy1 = dummy;
        // Create another dummy
        response = yield new Promise((resolve, reject) => {
            client.invoke({
                method: 'dummy.create_dummy',
                args_empty: false,
                args_json: JSON.stringify({
                    dummy: _dummy2
                })
            }, (err, response) => {
                if (err != null)
                    reject(err);
                else
                    resolve(response);
            });
        });
        assert.isFalse(response.result_empty);
        assert.isString(response.result_json);
        dummy = JSON.parse(response.result_json);
        assert.isObject(dummy);
        assert.equal(dummy.content, _dummy2.content);
        assert.equal(dummy.key, _dummy2.key);
        // Get all dummies
        response = yield new Promise((resolve, reject) => {
            client.invoke({
                method: 'dummy.get_dummies',
                args_empty: false,
                args_json: JSON.stringify({})
            }, (err, response) => {
                if (err != null)
                    reject(err);
                else
                    resolve(response);
            });
        });
        assert.isFalse(response.result_empty);
        assert.isString(response.result_json);
        let dummies = JSON.parse(response.result_json);
        assert.isObject(dummies);
        assert.lengthOf(dummies.data, 2);
        // Update the dummy
        dummy1.content = 'Updated Content 1';
        response = yield new Promise((resolve, reject) => {
            client.invoke({
                method: 'dummy.update_dummy',
                args_empty: false,
                args_json: JSON.stringify({
                    dummy: dummy1
                })
            }, (err, response) => {
                if (err != null)
                    reject(err);
                else
                    resolve(response);
            });
        });
        assert.isFalse(response.result_empty);
        assert.isString(response.result_json);
        dummy = JSON.parse(response.result_json);
        assert.isObject(dummy);
        assert.equal(dummy.content, 'Updated Content 1');
        assert.equal(dummy.key, _dummy1.key);
        dummy1 = dummy;
        // Delete dummy
        response = yield new Promise((resolve, reject) => {
            client.invoke({
                method: 'dummy.delete_dummy',
                args_empty: false,
                args_json: JSON.stringify({
                    dummy_id: dummy1.id
                })
            }, (err, response) => {
                if (err != null)
                    reject(err);
                else
                    resolve(response);
            });
        });
        assert.isNull(response.error);
        // Try to get delete dummy
        response = yield new Promise((resolve, reject) => {
            client.invoke({
                method: 'dummy.get_dummy_by_id',
                args_empty: false,
                args_json: JSON.stringify({
                    dummy_id: dummy1.id
                })
            }, (err, response) => {
                if (err != null)
                    reject(err);
                else
                    resolve(response);
            });
        });
        assert.isNull(response.error);
        assert.isTrue(response.result_empty);
    }));
});
//# sourceMappingURL=DummyCommandableGrpcService.test.js.map