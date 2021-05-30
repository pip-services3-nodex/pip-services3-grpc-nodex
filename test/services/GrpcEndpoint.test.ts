const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';

import { GrpcEndpoint } from '../../src/services/GrpcEndpoint';

let grpcConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

suite('GrpcEndpoint', ()=> {
    let endpoint: GrpcEndpoint;

    suiteSetup(async () => {
        endpoint = new GrpcEndpoint();
        endpoint.configure(grpcConfig);

        await endpoint.open(null);
    });
    
    suiteTeardown(async () => {
        await endpoint.close(null);
    });

    test('Is Open', () => {
        assert.isTrue(endpoint.isOpen());
    });

});
