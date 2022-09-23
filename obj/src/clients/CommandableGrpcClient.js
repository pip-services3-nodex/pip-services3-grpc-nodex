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
exports.CommandableGrpcClient = void 0;
/** @module clients */
const GrpcClient_1 = require("./GrpcClient");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
/**
 * Abstract client that calls commandable GRPC service.
 *
 * Commandable services are generated automatically for [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/interfaces/commands.icommandable.html ICommandable objects]].
 * Each command is exposed as Invoke method that receives all parameters as args.
 *
 * ### Configuration parameters ###
 *
 * - connection(s):
 *   - discovery_key:         (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *   - protocol:              connection protocol: http or https
 *   - host:                  host name or IP address
 *   - port:                  port number
 *   - uri:                   resource URI or connection string with all parameters in it
 * - options:
 *   - retries:               number of retries (default: 3)
 *   - connect_timeout:       connection timeout in milliseconds (default: 10 sec)
 *   - timeout:               invocation timeout in milliseconds (default: 10 sec)
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>         (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:counters:\*:\*:1.0</code>         (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/count.icounters.html ICounters]] components to pass collected measurements
 * - <code>\*:discovery:\*:\*:1.0</code>        (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services to resolve connection
 *
 * ### Example ###
 *
 *     class MyCommandableGrpcClient extends CommandableGrpcClient implements IMyClient {
 *        ...
 *
 *         public async getData(correlationId: string, id: string): Promise<MyData> {
 *
 *            return await this.callCommand(
 *                "get_data",
 *                correlationId,
 *                { id: id }
 *            );
 *         }
 *         ...
 *     }
 *
 *     let client = new MyCommandableGrpcClient();
 *     client.configure(ConfigParams.fromTuples(
 *         "connection.protocol", "http",
 *         "connection.host", "localhost",
 *         "connection.port", 8080
 *     ));
 *
 *     let result = await client.getData("123", "1");
 */
class CommandableGrpcClient extends GrpcClient_1.GrpcClient {
    /**
     * Creates a new instance of the client.
     *
     * @param name     a service name.
     */
    constructor(name) {
        super(__dirname + "../../../../src/protos/commandable.proto", "commandable.Commandable");
        this._name = name;
    }
    /**
     * Calls a remote method via GRPC commadable protocol.
     * The call is made via Invoke method and all parameters are sent in args object.
     * The complete route to remote method is defined as serviceName + "." + name.
     *
     * @param name              a name of the command to call.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param params            command parameters.
     * @returns the received result.
     */
    callCommand(name, correlationId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let method = this._name + '.' + name;
            let timing = this.instrument(correlationId, method);
            let request = {
                method: method,
                correlation_id: correlationId,
                args_empty: params == null,
                args_json: params != null ? JSON.stringify(params) : null
            };
            try {
                let response = yield this.call("invoke", correlationId, request);
                // Handle error response
                if (response.error != null) {
                    let err = pip_services3_commons_nodex_1.ApplicationExceptionFactory.create(response.error);
                    throw err;
                }
                // Handle empty response
                if (response.result_empty || response.result_json == null) {
                    return null;
                }
                // Handle regular response
                let result = JSON.parse(response.result_json);
                timing.endTiming();
                return result;
            }
            catch (ex) {
                timing.endFailure(ex);
                throw ex;
            }
        });
    }
}
exports.CommandableGrpcClient = CommandableGrpcClient;
//# sourceMappingURL=CommandableGrpcClient.js.map