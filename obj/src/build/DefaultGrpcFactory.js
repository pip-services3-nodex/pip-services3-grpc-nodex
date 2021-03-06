"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultGrpcFactory = void 0;
/** @module build */
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const GrpcEndpoint_1 = require("../services/GrpcEndpoint");
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
class DefaultGrpcFactory extends pip_services3_components_nodex_1.Factory {
    // public static readonly StatusServiceDescriptor = new Descriptor("pip-services", "status-service", "grpc", "*", "1.0");
    // public static readonly HeartbeatServiceDescriptor = new Descriptor("pip-services", "heartbeat-service", "grpc", "*", "1.0");
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.registerAsType(DefaultGrpcFactory.GrpcEndpointDescriptor, GrpcEndpoint_1.GrpcEndpoint);
        // this.registerAsType(DefaultRpcFactory.HeartbeatServiceDescriptor, HeartbeatGrpcService);
        // this.registerAsType(DefaultRpcFactory.StatusServiceDescriptor, StatusGrpcService);
    }
}
exports.DefaultGrpcFactory = DefaultGrpcFactory;
DefaultGrpcFactory.GrpcEndpointDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "endpoint", "grpc", "*", "1.0");
//# sourceMappingURL=DefaultGrpcFactory.js.map