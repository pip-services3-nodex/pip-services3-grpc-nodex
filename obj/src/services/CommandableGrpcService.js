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
exports.CommandableGrpcService = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const GrpcService_1 = require("./GrpcService");
/**
 * Abstract service that receives commands via GRPC protocol
 * to operations automatically generated for commands defined in [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/interfaces/commands.icommandable.html ICommandable components]].
 * Each command is exposed as invoke method that receives command name and parameters.
 *
 * Commandable services require only 3 lines of code to implement a robust external
 * GRPC-based remote interface.
 *
 * ### Configuration parameters ###
 *
 * - dependencies:
 *   - endpoint:              override for HTTP Endpoint dependency
 *   - controller:            override for Controller dependency
 * - connection(s):
 *   - discovery_key:         (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *   - protocol:              connection protocol: http or https
 *   - host:                  host name or IP address
 *   - port:                  port number
 *   - uri:                   resource URI or connection string with all parameters in it
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>               (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:counters:\*:\*:1.0</code>             (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/count.icounters.html ICounters]] components to pass collected measurements
 * - <code>\*:discovery:\*:\*:1.0</code>            (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services to resolve connection
 * - <code>\*:endpoint:grpc:\*:1.0</code>          (optional) [[GrpcEndpoint]] reference
 *
 * @see [[CommandableGrpcClient]]
 * @see [[GrpcService]]
 *
 * ### Example ###
 *
 *     class MyCommandableGrpcService extends CommandableGrpcService {
 *        public constructor() {
 *           base();
 *           this._dependencyResolver.put(
 *               "controller",
 *               new Descriptor("mygroup","controller","*","*","1.0")
 *           );
 *        }
 *     }
 *
 *     let service = new MyCommandableGrpcService();
 *     service.configure(ConfigParams.fromTuples(
 *         "connection.protocol", "http",
 *         "connection.host", "localhost",
 *         "connection.port", 8080
 *     ));
 *     service.setReferences(References.fromTuples(
 *        new Descriptor("mygroup","controller","default","default","1.0"), controller
 *     ));
 *
 *     await service.open("123");
 *     console.log("The GRPC service is running on port 8080");
 */
class CommandableGrpcService extends GrpcService_1.GrpcService {
    /**
     * Creates a new instance of the service.
     *
     * @param name a service name.
     */
    constructor(name) {
        super(null);
        this._name = name;
        this._dependencyResolver.put('controller', 'none');
    }
    applyCommand(schema, action) {
        let actionWrapper = (call) => __awaiter(this, void 0, void 0, function* () {
            let method = call.request.method;
            let correlationId = call.request.correlation_id;
            try {
                // Convert arguments
                let argsEmpty = call.request.args_empty;
                let argsJson = call.request.args_json;
                let args = !argsEmpty && argsJson ? pip_services3_commons_nodex_3.Parameters.fromJson(argsJson) : new pip_services3_commons_nodex_3.Parameters();
                // Todo: Validate schema
                if (schema) {
                    //...
                }
                // Call command action
                try {
                    let result = yield action(correlationId, args);
                    // Process result and generate response
                    return {
                        error: null,
                        result_empty: result == null,
                        result_json: result != null ? JSON.stringify(result) : null
                    };
                }
                catch (ex) {
                    return {
                        error: pip_services3_commons_nodex_1.ErrorDescriptionFactory.create(ex),
                        result_empty: true,
                        result_json: null
                    };
                }
            }
            catch (ex) {
                // Handle unexpected exception
                let err = new pip_services3_commons_nodex_2.InvocationException(correlationId, "METHOD_FAILED", "Method " + method + " failed").wrap(ex).withDetails("method", method);
                return {
                    error: pip_services3_commons_nodex_1.ErrorDescriptionFactory.create(err),
                    result_empty: true,
                    result_json: null
                };
            }
        });
        return actionWrapper;
    }
    /**
     * Registers a commandable method in this objects GRPC server (service) by the given name.,
     *
     * @param method        the GRPC method name.
     * @param schema        the schema to use for parameter validation.
     * @param action        the action to perform at the given route.
     */
    registerCommadableMethod(method, schema, action) {
        let actionWrapper = this.applyCommand(schema, action);
        actionWrapper = this.applyInterceptors(actionWrapper);
        this._endpoint.registerCommadableMethod(method, schema, actionWrapper);
    }
    /**
     * Registers all service routes in HTTP endpoint.
     */
    register() {
        let controller = this._dependencyResolver.getOneRequired('controller');
        this._commandSet = controller.getCommandSet();
        let commands = this._commandSet.getCommands();
        for (let index = 0; index < commands.length; index++) {
            let command = commands[index];
            let method = '' + this._name + '.' + command.getName();
            this.registerCommadableMethod(method, null, (correlationId, args) => {
                let timing = this.instrument(correlationId, method);
                try {
                    return command.execute(correlationId, args);
                }
                catch (ex) {
                    timing.endFailure(ex);
                }
                finally {
                    timing.endTiming();
                }
            });
        }
    }
}
exports.CommandableGrpcService = CommandableGrpcService;
//# sourceMappingURL=CommandableGrpcService.js.map