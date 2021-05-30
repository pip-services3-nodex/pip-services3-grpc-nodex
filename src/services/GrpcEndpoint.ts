/** @module services */
/** @hidden */
const fs = require('fs');

import { IOpenable } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IReferenceable } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { Parameters } from 'pip-services3-commons-nodex';
import { CompositeLogger } from 'pip-services3-components-nodex';
import { CompositeCounters } from 'pip-services3-components-nodex';
import { ErrorDescriptionFactory } from 'pip-services3-commons-nodex';
import { ConnectionException } from 'pip-services3-commons-nodex';
import { InvocationException } from 'pip-services3-commons-nodex';
import { HttpConnectionResolver } from 'pip-services3-rpc-nodex';
import { Schema } from 'pip-services3-commons-nodex';

import { IRegisterable } from './IRegisterable';

/**
 * Used for creating GRPC endpoints. An endpoint is a URL, at which a given service can be accessed by a client. 
 * 
 * ### Configuration parameters ###
 * 
 * Parameters to pass to the [[configure]] method for component configuration:
 * 
 * - connection(s) - the connection resolver's connections:
 *     - "connection.discovery_key" - the key to use for connection resolving in a discovery service;
 *     - "connection.protocol" - the connection's protocol;
 *     - "connection.host" - the target host;
 *     - "connection.port" - the target port;
 *     - "connection.uri" - the target URI.
 * - credential - the HTTPS credentials:
 *     - "credential.ssl_key_file" - the SSL private key in PEM
 *     - "credential.ssl_crt_file" - the SSL certificate in PEM
 *     - "credential.ssl_ca_file" - the certificate authorities (root cerfiticates) in PEM
 * 
 * ### References ###
 * 
 * A logger, counters, and a connection resolver can be referenced by passing the 
 * following references to the object's [[setReferences]] method:
 * 
 * - logger: <code>"\*:logger:\*:\*:1.0"</code>;
 * - counters: <code>"\*:counters:\*:\*:1.0"</code>;
 * - discovery: <code>"\*:discovery:\*:\*:1.0"</code> (for the connection resolver).
 * 
 * ### Examples ###
 * 
 *     public MyMethod(_config: ConfigParams, _references: IReferences) {
 *         let endpoint = new HttpEndpoint();
 *         if (this._config)
 *             endpoint.configure(this._config);
 *         if (this._references)
 *             endpoint.setReferences(this._references);
 *         ...
 * 
 *         await this._endpoint.open(correlationId);
 *     }
 */
export class GrpcEndpoint implements IOpenable, IConfigurable, IReferenceable {

    private static readonly _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        "connection.protocol", "http",
        "connection.host", "0.0.0.0",
        "connection.port", 3000,

        "credential.ssl_key_file", null,
        "credential.ssl_crt_file", null,
        "credential.ssl_ca_file", null,

        "options.maintenance_enabled", false,
        "options.request_max_size", 1024*1024,
        "options.file_max_size", 200*1024*1024,
        "options.connect_timeout", 60000,
        "options.debug", true
    );

	private _server: any;
	private _connectionResolver: HttpConnectionResolver = new HttpConnectionResolver();
	private _logger: CompositeLogger = new CompositeLogger();
	private _counters: CompositeCounters = new CompositeCounters();
    private _maintenanceEnabled: boolean = false;
    private _fileMaxSize: number = 200 * 1024 * 1024;
    private _uri: string;
    private _registrations: IRegisterable[] = [];
    private _commandableMethods: any;
    private _commandableSchemas: any;
    private _commandableService: any;
    
    /**
     * Configures this HttpEndpoint using the given configuration parameters.
     * 
     * __Configuration parameters:__
     * - __connection(s)__ - the connection resolver's connections;
     *     - "connection.discovery_key" - the key to use for connection resolving in a discovery service;
     *     - "connection.protocol" - the connection's protocol;
     *     - "connection.host" - the target host;
     *     - "connection.port" - the target port;
     *     - "connection.uri" - the target URI.
     *     - "credential.ssl_key_file" - SSL private key in PEM
     *     - "credential.ssl_crt_file" - SSL certificate in PEM
     *     - "credential.ssl_ca_file" - Certificate authority (root certificate) in PEM
     * 
     * @param config    configuration parameters, containing a "connection(s)" section.
     * 
     * @see [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/classes/config.configparams.html ConfigParams]] (in the PipServices "Commons" package)
     */
	public configure(config: ConfigParams): void {
		config = config.setDefaults(GrpcEndpoint._defaultConfig);
		this._connectionResolver.configure(config);

        this._maintenanceEnabled = config.getAsBooleanWithDefault('options.maintenance_enabled', this._maintenanceEnabled);
        this._fileMaxSize = config.getAsLongWithDefault('options.file_max_size', this._fileMaxSize)
    }
        
    /**
     * Sets references to this endpoint's logger, counters, and connection resolver.
     * 
     * __References:__
     * - logger: <code>"\*:logger:\*:\*:1.0"</code>
     * - counters: <code>"\*:counters:\*:\*:1.0"</code>
     * - discovery: <code>"\*:discovery:\*:\*:1.0"</code> (for the connection resolver)
     * 
     * @param references    an IReferences object, containing references to a logger, counters, 
     *                      and a connection resolver.
     * 
     * @see [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/interfaces/refer.ireferences.html IReferences]] (in the PipServices "Commons" package)
     */
	public setReferences(references: IReferences): void {
		this._logger.setReferences(references);
		this._counters.setReferences(references);
		this._connectionResolver.setReferences(references);
	}

    /**
     * @returns whether or not this endpoint is open with an actively listening GRPC server.
     */
	public isOpen(): boolean {
		return this._server != null;
	}
    
    //TODO: check for correct understanding.
    /**
     * Opens a connection using the parameters resolved by the referenced connection
     * resolver and creates a GRPC server (service) using the set options and parameters.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
	public async open(correlationId: string): Promise<void> {
    	if (this.isOpen()) {
            return;
        }
    	
		let connection = await this._connectionResolver.resolve(correlationId);

        this._uri = connection.getAsString("uri");

        try {
            let options: any = {};

            if (connection.getAsStringWithDefault("protocol", 'http') == 'https') {
                let sslKeyFile = connection.getAsNullableString('ssl_key_file');
                let privateKey = fs.readFileSync(sslKeyFile).toString();
    
                let sslCrtFile = connection.getAsNullableString('ssl_crt_file');
                let certificate = fs.readFileSync(sslCrtFile).toString();
    
                let ca = [];
                let sslCaFile = connection.getAsNullableString('ssl_ca_file');
                if (sslCaFile != null) {
                    let caText = fs.readFileSync(sslCaFile).toString();
                    while (caText != null && caText.trim().length > 0) {
                        let crtIndex = caText.lastIndexOf('-----BEGIN CERTIFICATE-----');
                        if (crtIndex > -1) {
                            ca.push(caText.substring(crtIndex));
                            caText = caText.substring(0, crtIndex);
                        }
                    }
                }
    
                options.kvpair = {
                    'private_key': privateKey,
                    'cert_chain': certificate
                };
                options.ca = ca;
            }
        
            // Create instance of express application   
            let grpc = require('grpc'); 
            this._server = new grpc.Server();
            
            let credentials = connection.getAsStringWithDefault("protocol", 'http') == 'https' 
                ? grpc.ServerCredentials.createSsl(options.ca, options.kvpair)
                : grpc.ServerCredentials.createInsecure();

            await new Promise<void>((resolve, reject) => {
                this._server.bindAsync(
                    connection.getAsString("host") + ":" + connection.getAsInteger("port"),
                    credentials,
                    (err) => {
                        if (err != null) {
                            reject(err);
                            return;
                        }
                        resolve();
                    }
                );
            });

            // Register the service URI
            await this._connectionResolver.register(correlationId);

            this._logger.debug(correlationId, "Opened GRPC service at %s", this._uri);
            
            // Start operations
            this.performRegistrations();
            this._server.start();
        } catch (ex) {
            this._server = null;

            throw new ConnectionException(
                correlationId,
                "CANNOT_CONNECT",
                "Opening GRPC service failed"
            ).wrap(ex).withDetails("url", this._uri);
        }
    }

    /**
     * Closes this endpoint and the GRPC server (service) that was opened earlier.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    public async close(correlationId: string): Promise<void> {
        if (this._server != null) {
            this._uri = null;
            this._commandableMethods = null;
            this._commandableSchemas = null;
            this._commandableService = null;

            // Eat exceptions
            try {
                await new Promise<void>((resolve, reject) => {
                    this._server.tryShutdown((err) => {
                        if (err != null) {
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                });

                this._logger.debug(correlationId, "Closed GRPC service at %s", this._uri);

                this._server = null;
            } catch (ex) {
                this._logger.warn(correlationId, "Failed while closing GRPC service: %s", ex);
                throw ex;
            }
        }
    }

    /**
     * Registers a registerable object for dynamic endpoint discovery.
     * 
     * @param registration      the registration to add. 
     * 
     * @see [[IRegisterable]]
     */
    public register(registration: IRegisterable): void {
        this._registrations.push(registration);
    }

    /**
     * Unregisters a registerable object, so that it is no longer used in dynamic 
     * endpoint discovery.
     * 
     * @param registration      the registration to remove. 
     * 
     * @see [[IRegisterable]]
     */
    public unregister(registration: IRegisterable): void {
        this._registrations = this._registrations.filter(r => r != registration);
    }

    private performRegistrations(): void {
        for (let registration of this._registrations) {
            registration.register();
        }

        this.registerCommandableService();
    }

    private registerCommandableService() {
        if (this._commandableMethods == null)  return;

        let grpc = require('grpc');
        let protoLoader = require('@grpc/proto-loader');

        let options = {
            keepCase: true,
            // longs: String,
            // enums: String,
            defaults: true,
            oneofs: true
        };

        let packageDefinition = protoLoader.loadSync(__dirname + "../../../../src/protos/commandable.proto", options);
        let packageObject = grpc.loadPackageDefinition(packageDefinition);
        let service = packageObject.commandable.Commandable.service;     

        this.registerService(
            service, 
            { 
                invoke: (call, callback) => { 
                    this.invokeCommandableMethod(call)
                    .then((result) => {
                        callback(null, result);
                    })
                    .catch((err) => {
                        callback(err, null);
                    }); 
                } 
            }
        );
    }

    private async invokeCommandableMethod(call: any): Promise<any> {
        let method = call.request.method;
        let action = this._commandableMethods ? this._commandableMethods[method] : null;
        let correlationId = call.request.correlation_id;

        // Handle method not found
        if (action == null) {
            let err = new InvocationException(correlationId, "METHOD_NOT_FOUND", "Method " + method + " was not found")
                .withDetails("method", method);
            
            let response = { 
                error: ErrorDescriptionFactory.create(err),
                result_empty: true,
                result_json: null 
            };

            return response;
        }

        try {
            // Convert arguments
            let argsEmpty = call.request.args_empty;
            let argsJson = call.request.args_json;
            let args = !argsEmpty && argsJson ? Parameters.fromJson(argsJson) : new Parameters();

            // Todo: Validate schema
            let schema = this._commandableSchemas[method];
            if (schema) {
                //...
            }

            // Call command action
            try {
                let result = await action(call, correlationId, args);

                // Process result and generate response
                return {
                    error: null,
                    result_empty: result == null,
                    result_json: result != null ? JSON.stringify(result): null 
                };
            } catch (ex) {
                return {
                    error: ErrorDescriptionFactory.create(ex),
                    result_empty: true,
                    result_json: null
                };            
            }
        } catch (ex) {
            // Handle unexpected exception
            let err = new InvocationException(correlationId, "METHOD_FAILED", "Method " + method + " failed")
                .wrap(ex).withDetails("method", method);
        
            return { 
                error: ErrorDescriptionFactory.create(err),
                result_empty: true,
                result_json: null 
            };
        }
    }

    /**
     * Registers a service with related implementation
     * 
     * @param service        a GRPC service object.
     * @param implementation the service implementation methods.
     */
    public registerService(service: any, implementation: any): void {
        this._server.addService(service, implementation);
    }

    /**
     * Registers a commandable method in this objects GRPC server (service) by the given name.,
     * 
     * @param method        the GRPC method name.
     * @param schema        the schema to use for parameter validation.
     * @param action        the action to perform at the given route.
     */
    public registerCommadableMethod(method: string, schema: Schema,
        action: (call: any, correlationId: string, args: Parameters) => Promise<any>): void {

        this._commandableMethods = this._commandableMethods || {};
        this._commandableMethods[method] = action;

        this._commandableSchemas = this._commandableSchemas || {};
        this._commandableSchemas[method] = schema;
    }

    // /**
    //  * Registers an action in this objects GRPC server (service) by the given method and route.
    //  * 
    //  * @param method        the HTTP method of the route.
    //  * @param route         the route to register in this object's GRPC server (service).
    //  * @param schema        the schema to use for parameter validation.
    //  * @param action        the action to perform at the given route.
    //  */
    // public registerRoute(method: string, route: string, schema: Schema,
    //     action: (req: any, res: any) => void): void {
    //     method = method.toLowerCase();
    //     if (method == 'delete') method = 'del';

    //     route = this.fixRoute(route);

    //     // Hack!!! Wrapping action to preserve prototyping context
    //     let actionCurl = (req, res) => { 
    //         // Perform validation
    //         if (schema != null) {
    //             let params = _.extend({}, req.params, { body: req.body });
    //             let correlationId = params.correlaton_id;
    //             let err = schema.validateAndReturnException(correlationId, params, false);
    //             if (err != null) {
    //                 HttpResponseSender.sendError(req, res, err);
    //                 return;
    //             }
    //         }

    //         // Todo: perform verification?
    //         action(req, res); 
    //     };

    //     // Wrapping to preserve "this"
    //     let self = this;
    //     this._server[method](route, actionCurl);
    // }   
    
    // /**
    //  * Registers an action with authorization in this objects GRPC server (service)
    //  * by the given method and route.
    //  * 
    //  * @param method        the HTTP method of the route.
    //  * @param route         the route to register in this object's GRPC server (service).
    //  * @param schema        the schema to use for parameter validation.
    //  * @param authorize     the authorization interceptor
    //  * @param action        the action to perform at the given route.
    //  */
    // public registerRouteWithAuth(method: string, route: string, schema: Schema,
    //     authorize: (req: any, res: any, next: () => void) => void,
    //     action: (req: any, res: any) => void): void {
            
    //     if (authorize) {
    //         let nextAction = action;
    //         action = (req, res) => {
    //             authorize(req, res, () => { nextAction(req, res); });
    //         }
    //     }

    //     this.registerRoute(method, route, schema, action);
    // }   

    // /**
    //  * Registers a middleware action for the given route.
    //  * 
    //  * @param route         the route to register in this object's GRPC server (service).
    //  * @param action        the middleware action to perform at the given route.
    //  */
    // public registerInterceptor(route: string,
    //     action: (req: any, res: any, next: () => void) => void): void {

    //     route = this.fixRoute(route);

    //     this._server.use((req, res, next) => {
    //         if (route != null && route != "" && !req.url.startsWith(route))
    //             next();
    //         else action(req, res, next);
    //     });
    // }

}