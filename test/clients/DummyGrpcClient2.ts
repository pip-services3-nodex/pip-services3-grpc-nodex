let _ = require('lodash');
let services = require('../../../test/protos/dummies_grpc_pb');
let messages = require('../../../test/protos/dummies_pb');

import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';

import { GrpcClient } from '../../src/clients/GrpcClient';
import { IDummyClient } from './IDummyClient';
import { Dummy } from '../Dummy';

export class DummyGrpcClient2 extends GrpcClient implements IDummyClient {
        
    public constructor() {
        super(services.DummiesClient)
    }

    public async getDummies(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<Dummy>> {
        paging = paging || new PagingParams();
        let pagingParams = new messages.PagingParams();
        pagingParams.setSkip(paging.skip);
        pagingParams.setTake(paging.take);
        pagingParams.setTotal(paging.total);

        let request = new messages.DummiesPageRequest();
        request.setPaging(pagingParams);

        filter = filter || new FilterParams();
        let filterParams = request.getFilterMap();
        for (let propName in filter) {
            if (filter.hasOwnProperty(propName)) {
                filterParams[propName] = filter[propName];
            }
        }

        this.instrument(correlationId, 'dummy.get_page_by_filter');

        let result = await this.call<any>('get_dummies',
            correlationId, 
            request
        );

        result = result != null ? result.toObject() : null;
        if (result) {
            result.data = result.dataList;
            delete result.dataList;
        }

        return result;
    }

    public async getDummyById(correlationId: string, dummyId: string): Promise<Dummy> {
        let request = new messages.DummyIdRequest();
        request.setDummyId(dummyId);

        this.instrument(correlationId, 'dummy.get_one_by_id');

        let result = await this.call<any>('get_dummy_by_id',
            correlationId,
            request
        );

        result = result != null ? result.toObject() : null;
        if (result && result.id == "" && result.key == "") {
            result = null;
        }

        return result;
    }

    public async createDummy(correlationId: string, dummy: any): Promise<Dummy> {
        let dummyObj = new messages.Dummy();
        dummyObj.setId(dummy.id);
        dummyObj.setKey(dummy.key);
        dummyObj.setContent(dummy.content);

        let request = new messages.DummyObjectRequest();
        request.setDummy(dummyObj);

        this.instrument(correlationId, 'dummy.create');

        let result = await this.call<any>('create_dummy',
            correlationId,
            request
        );

        result = result != null ? result.toObject() : null;
        if (result && result.id == "" && result.key == "") {
            result = null;
        }

        return result;
    }

    public async updateDummy(correlationId: string, dummy: any): Promise<Dummy> {
        let dummyObj = new messages.Dummy();
        dummyObj.setId(dummy.id);
        dummyObj.setKey(dummy.key);
        dummyObj.setContent(dummy.content);

        let request = new messages.DummyObjectRequest();
        request.setDummy(dummyObj);
    
        this.instrument(correlationId, 'dummy.update');

        let result = await this.call<any>('update_dummy',
            correlationId, 
            request
        );

        result = result != null ? result.toObject() : null;
        if (result && result.id == "" && result.key == "") {
            result = null;
        }

        return result;
    }

    public async deleteDummy(correlationId: string, dummyId: string): Promise<Dummy> {
        let request = new messages.DummyIdRequest();
        request.setDummyId(dummyId);

        this.instrument(correlationId, 'dummy.delete_by_id');

        let result = await this.call<any>('delete_dummy_by_id',
            correlationId, 
            request
        );

        result = result != null ? result.toObject() : null;
        if (result && result.id == "" && result.key == "") {
            result = null;
        }

        return result;
    }
  
}
