/** @module test */
import { CommandableGrpcClient } from "../clients/CommandableGrpcClient";
export declare class TestCommandableGrpcClient extends CommandableGrpcClient {
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
    callCommand<T>(name: string, correlationId: string, params: any): Promise<any>;
}
