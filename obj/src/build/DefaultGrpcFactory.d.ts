/** @module build */
import { Factory } from 'pip-services3-components-nodex';
/**
 * Creates GRPC components by their descriptors.
 *
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[GrpcEndpoint]]
 * @see [[HeartbeatGrpcService]]
 * @see [[StatusGrpcService]]
 */
export declare class DefaultGrpcFactory extends Factory {
    private static readonly GrpcEndpointDescriptor;
    /**
     * Create a new instance of the factory.
     */
    constructor();
}
