/** @module test */
import { GrpcClient } from "../clients/GrpcClient";

/**
 * GRPC client used for automated testing.
 */
export class TestGrpcClient extends GrpcClient {
    public constructor(clientTypeOrPath: any, clientName?: string, packageOptions?: any) {
        super(clientTypeOrPath, clientName, packageOptions);
    }

    /**
     * Calls a remote method via GRPC protocol.
     * 
     * @param method            a method name to called
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param request           (optional) request object.
     * @returns the received result.
     */
    public call<T>(method: string, correlationId?: string, request: any = {}): Promise<any> {
        return super.call<T>(method, correlationId, request);
    }
}