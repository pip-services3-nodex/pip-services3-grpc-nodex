/** @module clients */
import { GrpcClient } from './GrpcClient';
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
export declare class CommandableGrpcClient extends GrpcClient {
    /**
     * The service name
     */
    protected _name: string;
    /**
     * Creates a new instance of the client.
     *
     * @param name     a service name.
     */
    constructor(name: string);
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
    protected callCommand(name: string, correlationId: string, params: any): Promise<any>;
}
