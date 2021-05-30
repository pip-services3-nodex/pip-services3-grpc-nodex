"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCommandableGrpcClient = void 0;
/** @module test */
const CommandableGrpcClient_1 = require("../clients/CommandableGrpcClient");
class TestCommandableGrpcClient extends CommandableGrpcClient_1.CommandableGrpcClient {
    /**
     * Creates a new instance of the client.
     *
     * @param name     a service name.
     */
    constructor(name) {
        super(name);
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
        return super.callCommand(name, correlationId, params);
    }
}
exports.TestCommandableGrpcClient = TestCommandableGrpcClient;
//# sourceMappingURL=TestCommandableGrpcClient.js.map