const assert = require('chai').assert;
const grpc = require('@grpc/grpc-js');

const services = require('../../../test/protos/dummies_grpc_pb');
const messages = require('../../../test/protos/dummies_pb');

import { Descriptor } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';

import { Dummy } from '../Dummy';
import { DummyController } from '../DummyController';
import { DummyGrpcService } from './DummyGrpcService';

let grpcConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

suite('DummyGrpcService', ()=> {
    let _dummy1: Dummy;
    let _dummy2: Dummy;

    let service: DummyGrpcService;

    let client: any;

    suiteSetup(async () => {
        let ctrl = new DummyController();

        service = new DummyGrpcService();
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
        client = new services.DummiesClient('localhost:3000', grpc.credentials.createInsecure());

        _dummy1 = { id: null, key: "Key 1", content: "Content 1"};
        _dummy2 = { id: null, key: "Key 2", content: "Content 2"};
    });

    test('CRUD Operations', async () => {
        // Create one dummy
        let dummy: any = new messages.Dummy();
        dummy.setId(_dummy1.id);
        dummy.setKey(_dummy1.key);
        dummy.setContent(_dummy1.content);

        let request: any = new messages.DummyObjectRequest();
        request.setDummy(dummy);

        dummy = await new Promise<any>((resolve, reject) => {
            client.create_dummy(
                request,
                (err, dummy) => {
                    if (err != null) reject(err);
                    else resolve(dummy);
                }
            );
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

        dummy = await new Promise<any>((resolve, reject) => {
            client.create_dummy(
                request,
                (err, dummy) => {
                    if (err != null) reject(err);
                    else resolve(dummy);
                }
            );
        });
        dummy = dummy.toObject();
        assert.isObject(dummy);
        assert.equal(dummy.content, _dummy2.content);
        assert.equal(dummy.key, _dummy2.key);

        // Get all dummies
        request = new messages.DummiesPageRequest();

        let dummies: any = await new Promise<any>((resolve, reject) => {
            client.get_dummies(
                request,
                (err, dummies) => {
                    if (err != null) reject(err);
                    else resolve(dummies);
                }
            );
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

        dummy = await new Promise<any>((resolve, reject) => {
            client.update_dummy(
                request,
                (err, dummy) => {
                    if (err != null) reject(err);
                    else resolve(dummy);
                }
            );
        });
        dummy = dummy.toObject();
        assert.isObject(dummy);
        assert.equal(dummy.content, 'Updated Content 1');
        assert.equal(dummy.key, _dummy1.key);

        dummy1 = dummy;

        // Delete dummy
        request = new messages.DummyIdRequest();
        request.setDummyId(dummy1.id);

        dummy = await new Promise<any>((resolve, reject) => {
            client.delete_dummy_by_id(
                request,
                (err, dummy) => {
                    if (err != null) reject(err);
                    else resolve(dummy);
                }
            );
        });

        // Try to get delete dummy
        request = new messages.DummyIdRequest();
        request.setDummyId(dummy1.id);

        dummy = await new Promise<any>((resolve, reject) => {
            client.get_dummy_by_id(
                request,
                (err, dummy) => {
                    if (err != null) reject(err);
                    else resolve(dummy);
                }
            );
        });
        // assert.isObject(dummy);
    });

});
