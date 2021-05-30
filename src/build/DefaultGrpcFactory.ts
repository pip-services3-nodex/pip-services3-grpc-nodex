/** @module build */
import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { GrpcEndpoint } from '../services/GrpcEndpoint';
// import { HeartbeatGrpcService } from '../services/HeartbeatGrpcService';
// import { StatusGrpcService } from '../services/StatusGrpcService';

/**
 * Creates GRPC components by their descriptors.
 * 
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[GrpcEndpoint]]
 * @see [[HeartbeatGrpcService]]
 * @see [[StatusGrpcService]] 
 */
export class DefaultGrpcFactory extends Factory {
    private static readonly GrpcEndpointDescriptor: Descriptor = new Descriptor("pip-services", "endpoint", "grpc", "*", "1.0");
    // public static readonly StatusServiceDescriptor = new Descriptor("pip-services", "status-service", "grpc", "*", "1.0");
    // public static readonly HeartbeatServiceDescriptor = new Descriptor("pip-services", "heartbeat-service", "grpc", "*", "1.0");

    /**
	 * Create a new instance of the factory.
	 */
    public constructor() {
        super();
        this.registerAsType(DefaultGrpcFactory.GrpcEndpointDescriptor, GrpcEndpoint);
        // this.registerAsType(DefaultRpcFactory.HeartbeatServiceDescriptor, HeartbeatGrpcService);
        // this.registerAsType(DefaultRpcFactory.StatusServiceDescriptor, StatusGrpcService);
    }
}
