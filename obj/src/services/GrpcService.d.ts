/** @module services */
import { IOpenable } from 'pip-services3-commons-nodex';
import { IUnreferenceable } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IReferenceable } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { DependencyResolver } from 'pip-services3-commons-nodex';
import { CompositeLogger } from 'pip-services3-components-nodex';
import { CompositeCounters } from 'pip-services3-components-nodex';
import { CompositeTracer } from 'pip-services3-components-nodex';
import { InstrumentTiming } from 'pip-services3-rpc-nodex';
import { Schema } from 'pip-services3-commons-nodex';
import { GrpcEndpoint } from './GrpcEndpoint';
import { IRegisterable } from './IRegisterable';
/**
 * Abstract service that receives remove calls via GRPC protocol.
 *
 * ### Configuration parameters ###
 *
 * - dependencies:
 *   - endpoint:              override for GRPC Endpoint dependency
 *   - controller:            override for Controller dependency
 * - connection(s):
 *   - discovery_key:         (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *   - protocol:              connection protocol: http or https
 *   - host:                  host name or IP address
 *   - port:                  port number
 *   - uri:                   resource URI or connection string with all parameters in it
 * - credential - the HTTPS credentials:
 *   - ssl_key_file:         the SSL private key in PEM
 *   - ssl_crt_file:         the SSL certificate in PEM
 *   - ssl_ca_file:          the certificate authorities (root cerfiticates) in PEM
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>               (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:counters:\*:\*:1.0</code>             (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/count.icounters.html ICounters]] components to pass collected measurements
 * - <code>\*:discovery:\*:\*:1.0</code>            (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services to resolve connection
 * - <code>\*:endpoint:grpc:\*:1.0</code>           (optional) [[GrpcEndpoint]] reference
 *
 * @see [[GrpcClient]]
 *
 * ### Example ###
 *
 *     class MyGrpcService extends GrpcService {
 *        private _controller: IMyController;
 *        ...
 *        public constructor() {
 *           base('... path to proto ...', '.. service name ...');
 *           this._dependencyResolver.put(
 *               "controller",
 *               new Descriptor("mygroup","controller","*","*","1.0")
 *           );
 *        }
 *
 *        public setReferences(references: IReferences): void {
 *           base.setReferences(references);
 *           this._controller = this._dependencyResolver.getRequired<IMyController>("controller");
 *        }
 *
 *        public register(): void {
 *            registerMethod("get_mydata", null, async (call) => {
 *                let correlationId = call.request.correlationId;
 *                let id = call.request.id;
 *                return await this._controller.getMyData(correlationId, id);
 *            });
 *            ...
 *        }
 *     }
 *
 *     let service = new MyGrpcService();
 *     service.configure(ConfigParams.fromTuples(
 *         "connection.protocol", "http",
 *         "connection.host", "localhost",
 *         "connection.port", 8080
 *     ));
 *     service.setReferences(References.fromTuples(
 *        new Descriptor("mygroup","controller","default","default","1.0"), controller
 *     ));
 *
 *     service.open("123");
 *     console.log("The GRPC service is running on port 8080");
 */
export declare abstract class GrpcService implements IOpenable, IConfigurable, IReferenceable, IUnreferenceable, IRegisterable {
    private static readonly _defaultConfig;
    private _service;
    private _protoPath;
    private _serviceName;
    private _packageOptions;
    private _config;
    private _references;
    private _localEndpoint;
    private _registerable;
    private _implementation;
    private _interceptors;
    private _opened;
    /**
     * The GRPC endpoint that exposes this service.
     */
    protected _endpoint: GrpcEndpoint;
    /**
     * The dependency resolver.
     */
    protected _dependencyResolver: DependencyResolver;
    /**
     * The logger.
     */
    protected _logger: CompositeLogger;
    /**
     * The performance counters.
     */
    protected _counters: CompositeCounters;
    /**
     * The tracer.
     */
    protected _tracer: CompositeTracer;
    constructor(serviceOrPath: any, serviceName?: string, packageOptions?: any);
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config: ConfigParams): void;
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references: IReferences): void;
    /**
     * Unsets (clears) previously set references to dependent components.
     */
    unsetReferences(): void;
    private createEndpoint;
    /**
     * Adds instrumentation to log calls and measure call time.
     * It returns a Timing object that is used to end the time measurement.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param name              a method name.
     * @returns Timing object to end the time measurement.
     */
    protected instrument(correlationId: string, name: string): InstrumentTiming;
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen(): boolean;
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    open(correlationId: string): Promise<void>;
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId: string): Promise<void>;
    private registerService;
    private getServiceByName;
    protected applyValidation(schema: Schema, action: (call: any) => Promise<any>): (call: any) => Promise<any>;
    protected applyInterceptors(action: (call: any) => Promise<any>): (call: any) => Promise<any>;
    /**
     * Registers a method in GRPC service.
     *
     * @param name          a method name
     * @param schema        a validation schema to validate received parameters.
     * @param action        an action function that is called when operation is invoked.
     */
    protected registerMethod(name: string, schema: Schema, action: (call: any) => Promise<any>): void;
    /**
     * Registers a method with authorization.
     *
     * @param name          a method name
     * @param schema        a validation schema to validate received parameters.
     * @param authorize     an authorization interceptor
     * @param action        an action function that is called when operation is invoked.
     */
    protected registerMethodWithAuth(name: string, schema: Schema, authorize: (call: any, next: (call: any) => Promise<any>) => Promise<any>, action: (call: any) => Promise<any>): void;
    /**
     * Registers a middleware for methods in GRPC endpoint.
     *
     * @param action        an action function that is called when middleware is invoked.
     */
    protected registerInterceptor(action: (call: any, next: (call: any) => Promise<any>) => Promise<any>): void;
    /**
     * Registers all service routes in HTTP endpoint.
     *
     * This method is called by the service and must be overriden
     * in child classes.
     */
    abstract register(): void;
}
