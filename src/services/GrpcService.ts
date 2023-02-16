/** @module services */
import { IOpenable } from 'pip-services3-commons-nodex';
import { IUnreferenceable } from 'pip-services3-commons-nodex';
import { InvalidStateException } from 'pip-services3-commons-nodex';
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
export abstract class GrpcService implements IOpenable, IConfigurable, IReferenceable,
    IUnreferenceable, IRegisterable {

    private static readonly _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        "dependencies.endpoint", "*:endpoint:grpc:*:1.0"
    );

    private _service: any;
    private _protoPath: string;
    private _serviceName: string;
    private _packageOptions: any;
    private _config: ConfigParams;
    private _references: IReferences;
    private _localEndpoint: boolean;
    private _registerable: IRegisterable;
    private _implementation: any = {};
    private _interceptors: any[] = [];
    private _opened: boolean;

    /**
     * The GRPC endpoint that exposes this service.
     */
    protected _endpoint: GrpcEndpoint;    
    /**
     * The dependency resolver.
     */
    protected _dependencyResolver: DependencyResolver = new DependencyResolver(GrpcService._defaultConfig);
    /**
     * The logger.
     */
    protected _logger: CompositeLogger = new CompositeLogger();
    /**
     * The performance counters.
     */
	protected _counters: CompositeCounters = new CompositeCounters();
    /**
     * The tracer.
     */
    protected _tracer: CompositeTracer = new CompositeTracer();

    public constructor(serviceOrPath: any, serviceName?: string, packageOptions?: any) {
        this._service = (typeof serviceOrPath !== "string") ? serviceOrPath : null;
        this._protoPath = (typeof serviceOrPath === "string") ? serviceOrPath : null;
        this._serviceName = serviceName;
        this._packageOptions = packageOptions;

        this._registerable = {
            register: () => {
                this.registerService();
            }
        }
    }

    /**
     * Configures component by passing configuration parameters.
     * 
     * @param config    configuration parameters to be set.
     */
	public configure(config: ConfigParams): void {
        config = config.setDefaults(GrpcService._defaultConfig);

        this._config = config;
        this._dependencyResolver.configure(config);
	}

    /**
	 * Sets references to dependent components.
	 * 
	 * @param references 	references to locate the component dependencies. 
     */
	public setReferences(references: IReferences): void {
        this._references = references;

		this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._tracer.setReferences(references);
        this._dependencyResolver.setReferences(references);

        // Get endpoint
        this._endpoint = this._dependencyResolver.getOneOptional('endpoint');
        // Or create a local one
        if (this._endpoint == null) {
            this._endpoint = this.createEndpoint();
            this._localEndpoint = true;
        } else {
            this._localEndpoint = false;
        }
        // Add registration callback to the endpoint
        this._endpoint.register(this._registerable);
    }
    
    /**
	 * Unsets (clears) previously set references to dependent components. 
     */
    public unsetReferences(): void {
        // Remove registration callback from endpoint
        if (this._endpoint != null) {
            this._endpoint.unregister(this._registerable);
            this._endpoint = null;
        }
    }

    private createEndpoint(): GrpcEndpoint {
        let endpoint = new GrpcEndpoint();
        
        if (this._config) {
            endpoint.configure(this._config);
        }
        
        if (this._references) {
            endpoint.setReferences(this._references);
        }
            
        return endpoint;
    }

    /**
     * Adds instrumentation to log calls and measure call time.
     * It returns a Timing object that is used to end the time measurement.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param name              a method name.
     * @returns Timing object to end the time measurement.
     */
     protected instrument(correlationId: string, name: string): InstrumentTiming {
        this._logger.trace(correlationId, "Executing %s method", name);
        this._counters.incrementOne(name + ".exec_count");

		let counterTiming = this._counters.beginTiming(name + ".exec_time");
        let traceTiming = this._tracer.beginTrace(correlationId, name, null);
        return new InstrumentTiming(correlationId, name, "exec",
            this._logger, this._counters, counterTiming, traceTiming);
    }

    // /**
    //  * Adds instrumentation to error handling.
    //  * 
    //  * @param correlationId     (optional) transaction id to trace execution through call chain.
    //  * @param name              a method name.
    //  * @param err               an occured error
    //  * @param result            (optional) an execution result
    //  * @param callback          (optional) an execution callback
    //  */
    // protected instrumentError(correlationId: string, name: string, err: any,
    //     result: any = null, callback: (err: any, result: any) => void = null): void {
    //     if (err != null) {
    //         this._logger.error(correlationId, err, "Failed to execute %s method", name);
    //         this._counters.incrementOne(name + '.exec_errors');    
    //     }

    //     if (callback) callback(err, result);
    // }   

    /**
	 * Checks if the component is opened.
	 * 
	 * @returns true if the component has been opened and false otherwise.
     */
	public isOpen(): boolean {
		return this._opened;
	}
    
    /**
	 * Opens the component.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
	public async open(correlationId: string): Promise<void> {
    	if (this._opened) {
            return;
        }
        
        if (this._endpoint == null) {
            this._endpoint = this.createEndpoint();
            this._endpoint.register(this);
            this._localEndpoint = true;
        }

        if (this._localEndpoint) {
            await this._endpoint.open(correlationId);
        }

        this._opened = true;
    }

    /**
	 * Closes component and frees used resources.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    public async close(correlationId: string): Promise<void> {
    	if (!this._opened) {
            return;
        }

        if (this._endpoint == null) {
            throw new InvalidStateException(
                correlationId,
                'NO_ENDPOINT',
                'GRPC endpoint is missing'
            );
        }
        
        if (this._localEndpoint) {
            await this._endpoint.close(correlationId);
        }

        this._opened = false;
    }

    private registerService() {
        // Register implementations
        this._implementation = {};
        this._interceptors = [];
        this.register();
    
        // Load service
        let grpc = require('@grpc/grpc-js');
        let service = this._service;

        // Dynamically load service
        if (service == null && typeof this._protoPath === "string") {
            let protoLoader = require('@grpc/proto-loader');

            let options = this._packageOptions || {
                keepCase: true,
                longs: Number,
                enums: Number,
                defaults: true,
                oneofs: true
            };

            let packageDefinition = protoLoader.loadSync(this._protoPath, options);
            let packageObject = grpc.loadPackageDefinition(packageDefinition);
            service = this.getServiceByName(packageObject, this._serviceName);            
        } 
        // Statically load service
        else {
            service = this.getServiceByName(this._service, this._serviceName);
        }

        // Register service if it is set
        if (service) {
            this._endpoint.registerService(service, this._implementation);
        }
    }

    private getServiceByName(packageObject: any, serviceName: string): any {
        if (packageObject == null || serviceName == null)
            return packageObject;

        let names = serviceName.split(".");
        for (let name of names) {
            packageObject = packageObject[name];
            if (packageObject == null) break;
        }

        return packageObject;
    }

    protected applyValidation(schema: Schema, action: (call: any) => Promise<any>): (call: any) => Promise<any> {
        // Create an action function
        let actionWrapper = async (call) => {
            // Validate object
            if (schema && call && call.request) {
                let value = call.request;
                if (typeof value.toObject === "function") {
                    value = value.toObject();
                }

                // Perform validation                    
                let correlationId = value.correlation_id;
                let err = schema.validateAndReturnException(correlationId, value, false);
                if (err) {
                    throw err;
                }
            }

            let result = await action.call(this, call);
            return result;
        };

        return actionWrapper;
    }

    protected applyInterceptors(action: (call: any) => Promise<any>): (call: any) => Promise<any> {
        let actionWrapper = action;

        for (let index = this._interceptors.length - 1; index >= 0; index--) {
            let interceptor = this._interceptors[index];
            actionWrapper = ((action) => { 
                return (call) => {
                    return interceptor(call, action);
                };
            })(actionWrapper);
        }

        return actionWrapper;
    }
    
    /**
     * Registers a method in GRPC service.
     * 
     * @param name          a method name
     * @param schema        a validation schema to validate received parameters.
     * @param action        an action function that is called when operation is invoked.
     */
    protected registerMethod(name: string, schema: Schema, action: (call: any) => Promise<any>): void {
        if (this._implementation == null) return;

        let actionWrapper = this.applyValidation(schema, action);
        actionWrapper = this.applyInterceptors(actionWrapper);

        // Assign method implementation
        this._implementation[name] = (call, callback) => { 
            actionWrapper(call)
            .then((result) => {
                callback(null, result);
            })
            .catch((err) => {
                callback(err, null);
            }); 
        };
    }    

    /**
     * Registers a method with authorization.
     * 
     * @param name          a method name
     * @param schema        a validation schema to validate received parameters.
     * @param authorize     an authorization interceptor
     * @param action        an action function that is called when operation is invoked.
     */
    protected registerMethodWithAuth(name: string, schema: Schema,
        authorize: (call: any, next: (call: any) => Promise<any>) => Promise<any>,
        action: (call: any) => Promise<any>): void {

        let actionWrapper = this.applyValidation(schema, action);
        // Add authorization just before validation
        actionWrapper = (call) => {
            return authorize(call, actionWrapper);
        };
        actionWrapper = this.applyInterceptors(actionWrapper);

        // Assign method implementation
        this._implementation[name] = (call, callback) => { 
            actionWrapper(call)
            .then((result) => {
                callback(null, result);
            })
            .catch((err) => {
                callback(err, null);
            }); 
        };
    }    

    /**
     * Registers a middleware for methods in GRPC endpoint.
     * 
     * @param action        an action function that is called when middleware is invoked.
     */
    protected registerInterceptor(action: (call: any, next: (call: any) => Promise<any>) => Promise<any>): void {
        if (this._endpoint == null) return;

        this._interceptors.push((call, next) => {
            return action.call(this, call, next);
        });
    }    
    
    /**
     * Registers all service routes in HTTP endpoint.
     * 
     * This method is called by the service and must be overriden
     * in child classes.
     */
    public abstract register(): void;

}