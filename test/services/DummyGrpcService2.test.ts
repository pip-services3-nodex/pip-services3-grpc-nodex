const assert = require('chai').assert;
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const services = require('../../../test/protos/dummies_grpc_pb');
const messages = require('../../../test/protos/dummies_pb');

import { Descriptor } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';

import { Dummy } from '../Dummy';
import { DummyController } from '../DummyController';
import { DummyGrpcService2 } from './DummyGrpcService2';

let grpcConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

suite('DummyGrpcService2', ()=> {
    let _dummy1: Dummy;
    let _dummy2: Dummy;

    let service: DummyGrpcService2;

    let client: any;

    suiteSetup(async () => {
        let ctrl = new DummyController();

        service = new DummyGrpcService2();
        service.configure(grpcConfig);

        let references: References = References.fromTuples(
            new Descriptor('pip-services-dummies', 'controller', 'default', 'default', '1.0'), ctrl,
            new Descriptor('pip-services-dummies', 'service', 'grpc', 'default', '1.0'), service
        );
        service.setReferences(references);

        await service.open(null);
    });
    
    suiteTeardown(async () => {
        await service.close(null);
    });

    setup(() => {
        let packageDefinition = protoLoader.loadSync(
            __dirname + "../../../../test/protos/dummies.proto",
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            }
        );
        let clientProto = grpc.loadPackageDefinition(packageDefinition).dummies.Dummies;

        client = new clientProto('localhost:3000', grpc.credentials.createInsecure());

        _dummy1 = { id: null, key: "Key 1", content: "Content 1"};
        _dummy2 = { id: null, key: "Key 2", content: "Content 2"};
    });

    test('CRUD Operations', async () => {
        // Create one dummy
        let dummy = await new Promise<any>((resolve, reject) => {
            client.create_dummy(
                { dummy: _dummy1 },
                (err, dummy) => {
                    if (err != null) reject(err);
                    else resolve(dummy);
                }
            );
        });
        assert.isObject(dummy);
        assert.equal(dummy.content, _dummy1.content);
        assert.equal(dummy.key, _dummy1.key);

        let dummy1 = dummy;

        // Create another dummy
        dummy = await new Promise<any>((resolve, reject) => {
            client.create_dummy(
                { dummy: _dummy2 },
                (err, dummy) => {
                    if (err != null) reject(err);
                    else resolve(dummy);
                }
            );
        });
        assert.isObject(dummy);
        assert.equal(dummy.content, _dummy2.content);
        assert.equal(dummy.key, _dummy2.key);

        // Get all dummies
        let dummies = await new Promise<any>((resolve, reject) => {
            client.get_dummies(
                {},
                (err, dummies) => {
                    if (err != null) reject(err);
                    else resolve(dummies);
                }
            );
        });
        assert.isObject(dummies);
        assert.lengthOf(dummies.data, 2);

        // Update the dummy
        dummy1.content = 'Updated Content 1';
        dummy = await new Promise<any>((resolve, reject) => {
            client.update_dummy(
                { dummy: dummy1 },
                (err, dummy) => {
                    if (err != null) reject(err);
                    else resolve(dummy);
                }
            );
        });                        
        assert.isObject(dummy);
        assert.equal(dummy.content, 'Updated Content 1');
        assert.equal(dummy.key, _dummy1.key);

        dummy1 = dummy;

        // Delete dummy
        dummy = await new Promise<any>((resolve, reject) => {
            client.delete_dummy_by_id(
                { dummy_id: dummy1.id },
                (err, dummy) => {
                    if (err != null) reject(err);
                    else resolve(dummy);
                }
            );
        });

        // Try to get delete dummy
        dummy = await new Promise<any>((resolve, reject) => {
            client.get_dummy_by_id(
                { dummy_id: dummy1.id },
                (err, dummy) => {
                    if (err != null) reject(err);
                    else resolve(dummy);
                }
            );
        });
        // assert.isObject(dummy);
    });

});
