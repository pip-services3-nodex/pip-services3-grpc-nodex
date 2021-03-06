import { Descriptor } from 'pip-services3-commons-nodex';
import { CommandableGrpcService } from '../../src/services/CommandableGrpcService';

export class DummyCommandableGrpcService extends CommandableGrpcService {
    public constructor() {
        super('dummy');
        this._dependencyResolver.put('controller', new Descriptor('pip-services-dummies', 'controller', 'default', '*', '*'));
    }
}