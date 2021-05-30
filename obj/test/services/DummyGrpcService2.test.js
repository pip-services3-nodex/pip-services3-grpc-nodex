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
const services = require('../../../test/protos/dummies_grpc_pb');
const messages = require('../../../test/protos/dummies_pb');
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const DummyController_1 = require("../DummyController");
const DummyGrpcService2_1 = require("./DummyGrpcService2");
let grpcConfig = pip_services3_commons_nodex_2.ConfigParams.fromTuples("connection.protocol", "http", "connection.host", "localhost", "connection.port", 3000);
suite('DummyGrpcService2', () => {
    let _dummy1;
    let _dummy2;
    let service;
    let client;
    suiteSetup(() => __awaiter(void 0, void 0, void 0, function* () {
        let ctrl = new DummyController_1.DummyController();
        service = new DummyGrpcService2_1.DummyGrpcService2();
        service.configure(grpcConfig);
        let references = pip_services3_commons_nodex_3.References.fromTuples(new pip_services3_commons_nodex_1.Descriptor('pip-services-dummies', 'controller', 'default', 'default', '1.0'), ctrl, new pip_services3_commons_nodex_1.Descriptor('pip-services-dummies', 'service', 'grpc', 'default', '1.0'), service);
        service.setReferences(references);
        yield service.open(null);
    }));
    suiteTeardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield service.close(null);
    }));
    setup(() => {
        let packageDefinition = protoLoader.loadSync(__dirname + "../../../../test/protos/dummies.proto", {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
        let clientProto = grpc.loadPackageDefinition(packageDefinition).dummies.Dummies;
        client = new clientProto('localhost:3000', grpc.credentials.createInsecure());
        _dummy1 = { id: null, key: "Key 1", content: "Content 1" };
        _dummy2 = { id: null, key: "Key 2", content: "Content 2" };
    });
    test('CRUD Operations', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create one dummy
        let dummy = yield new Promise((resolve, reject) => {
            client.create_dummy({ dummy: _dummy1 }, (err, dummy) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummy);
            });
        });
        assert.isObject(dummy);
        assert.equal(dummy.content, _dummy1.content);
        assert.equal(dummy.key, _dummy1.key);
        let dummy1 = dummy;
        // Create another dummy
        dummy = yield new Promise((resolve, reject) => {
            client.create_dummy({ dummy: _dummy2 }, (err, dummy) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummy);
            });
        });
        assert.isObject(dummy);
        assert.equal(dummy.content, _dummy2.content);
        assert.equal(dummy.key, _dummy2.key);
        // Get all dummies
        let dummies = yield new Promise((resolve, reject) => {
            client.get_dummies({}, (err, dummies) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummies);
            });
        });
        assert.isObject(dummies);
        assert.lengthOf(dummies.data, 2);
        // Update the dummy
        dummy1.content = 'Updated Content 1';
        dummy = yield new Promise((resolve, reject) => {
            client.update_dummy({ dummy: dummy1 }, (err, dummy) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummy);
            });
        });
        assert.isObject(dummy);
        assert.equal(dummy.content, 'Updated Content 1');
        assert.equal(dummy.key, _dummy1.key);
        dummy1 = dummy;
        // Delete dummy
        dummy = yield new Promise((resolve, reject) => {
            client.delete_dummy_by_id({ dummy_id: dummy1.id }, (err, dummy) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummy);
            });
        });
        // Try to get delete dummy
        dummy = yield new Promise((resolve, reject) => {
            client.get_dummy_by_id({ dummy_id: dummy1.id }, (err, dummy) => {
                if (err != null)
                    reject(err);
                else
                    resolve(dummy);
            });
        });
        // assert.isObject(dummy);
    }));
});
//# sourceMappingURL=DummyGrpcService2.test.js.map