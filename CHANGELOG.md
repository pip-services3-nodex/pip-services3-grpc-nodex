# <img src="https://uploads-ssl.webflow.com/5ea5d3315186cf5ec60c3ee4/5edf1c94ce4c859f2b188094_logo.svg" alt="Pip.Services Logo" width="200"> <br/> GRPC components for Pip.Services in Node.js / ES2017 Changelog

## <a name="1.1.0-"></a> 1.1.0 (2023-02-16)

### Features
- Migrated from grpc to @grpc/grpc-js driver
## <a name="1.0.1-1.0.5"></a> 1.0.1 - 1.0.5 (2022-04-11)

### Bug fixes
* Fixed google-protobuf dependency
* Fixed instrument method in GrpcClient
* Add generic typing to client call methods
* Fixed validation in while calling auth interceptor
* Fixed interceptors for commandable interface


## <a name="1.0.0"></a> 1.0.0 (2021-05-28)

### Features
* **clients** GrpcClient, CommandableGrpcClient
* **services** GrpcEndpoint, GrpcService, CommandableGrpcService
