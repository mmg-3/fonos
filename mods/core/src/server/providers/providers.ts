import grpc from 'grpc'
import {
  Provider,
  ListProvidersRequest,
  ListProvidersResponse,
  GetProviderRequest,
  CreateProviderRequest,
  UpdateProviderRequest,
  DeleteProviderRequest
} from '../protos/providers_pb'
import { Empty } from '../protos/common_pb'
import {
  IProvidersService,
  ProvidersService,
  IProvidersServer
} from '../protos/providers_grpc_pb'
import { Kind, REncoder } from '../../common/resource_encoder'
import { FonosAuthError } from '@fonos/errors'
import { auth } from '../../common/trust_util'
import updateResource from '../resources/update_resource'
import createResource from '../resources/create_resource'
import providerDecoder from '../../common/decoders/provider_decoder'
import ResourceServer from '../resources/resource_server'

class ProvidersServer extends ResourceServer implements IProvidersServer {
  constructor () {
    super(Kind.GATEWAY, providerDecoder)
  }

  async listProviders (
    call: grpc.ServerUnaryCall<ListProvidersRequest>,
    callback: grpc.sendUnaryData<ListProvidersResponse>
  ) {
    super.listResources(call, callback)
  }

  async createProvider (
    call: grpc.ServerUnaryCall<CreateProviderRequest>,
    callback: grpc.sendUnaryData<Provider>
  ) {
    if (!auth(call)) return callback(new FonosAuthError(), null)
    const provider = call.request.getProvider()

    try {
      const resource = new REncoder(
        Kind.GATEWAY,
        provider.getName(),
        provider.getRef()
      )
        .withCredentials(provider.getUsername(), provider.getSecret())
        .withHost(provider.getHost())
        .withTransport(provider.getTransport())
        .withExpires(provider.getExpires())
        .build()

      callback(null, await createResource(resource, providerDecoder))
    } catch (e) {
      callback(e, null)
    }
  }

  async updateProvider (
    call: grpc.ServerUnaryCall<UpdateProviderRequest>,
    callback: grpc.sendUnaryData<Provider>
  ) {
    const provider = call.request.getProvider()

    try {
      const resource = new REncoder(
        Kind.GATEWAY,
        provider.getName(),
        provider.getRef()
      )
        .withMetadata({
          createdOn: provider.getCreateTime(),
          modifiedOn: provider.getUpdateTime()
        })
        .withCredentials(provider.getUsername(), provider.getSecret())
        .withHost(provider.getHost())
        .withTransport(provider.getTransport())
        .withExpires(provider.getExpires())
        .build()

      callback(null, await updateResource(resource, providerDecoder))
    } catch (e) {
      callback(e, null)
    }
  }

  async getProvider (
    call: grpc.ServerUnaryCall<GetProviderRequest>,
    callback: grpc.sendUnaryData<Provider>
  ) {
    super.getResource(call, callback)
  }

  async deleteProvider (
    call: grpc.ServerUnaryCall<DeleteProviderRequest>,
    callback: grpc.sendUnaryData<Empty>
  ) {
    super.deleteResource(call, callback)
  }
}

export { ProvidersServer as default, IProvidersService, ProvidersService }
