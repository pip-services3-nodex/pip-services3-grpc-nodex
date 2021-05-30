import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';

import { GrpcClient } from '../../src/clients/GrpcClient';
import { IDummyClient } from './IDummyClient';
import { Dummy } from '../Dummy';

export class DummyGrpcClient extends GrpcClient implements IDummyClient {
        
    public constructor() {
        super(__dirname + "../../../../test/protos/dummies.proto", "dummies.Dummies")
    }

    public async getDummies(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<Dummy>> {
        this.instrument(correlationId, 'dummy.get_page_by_filter');
        return await this.call('get_dummies',
            correlationId, 
            { 
                filter: filter,
                paging: paging
            }
        );
    }

    public async getDummyById(correlationId: string, dummyId: string): Promise<Dummy> {
        this.instrument(correlationId, 'dummy.get_one_by_id');
        let result = await this.call('get_dummy_by_id',
            correlationId,
            {
                dummy_id: dummyId
            }
        );

        if (result && result.id == "" && result.key == "") {
            result = null;
        }

        return result;
    }

    public async createDummy(correlationId: string, dummy: any): Promise<Dummy> {
        this.instrument(correlationId, 'dummy.create');
        let result = await this.call('create_dummy',
            correlationId,
            {
                dummy: dummy
            }
        );

        if (result && result.id == "" && result.key == "") {
            result = null;
        }

        return result;
    }

    public async updateDummy(correlationId: string, dummy: any): Promise<Dummy> {
        this.instrument(correlationId, 'dummy.update');
        let result = await this.call('update_dummy',
            correlationId, 
            {
                dummy: dummy
            }
        );

        if (result && result.id == "" && result.key == "") {
            result = null;
        }

        return result;
    }

    public async deleteDummy(correlationId: string, dummyId: string): Promise<Dummy> {
        this.instrument(correlationId, 'dummy.delete_by_id');
        let result = await this.call('delete_dummy_by_id',
            correlationId, 
            {
                dummy_id: dummyId
            }
        );

        if (result && result.id == "" && result.key == "") {
            result = null;
        }

        return result;
    }
  
}
