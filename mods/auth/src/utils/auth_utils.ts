import JwtPayload from './jwt_payload'
import ITokenManager from './itoken_manager'

export declare interface UserToken {
  accessToken: string
}

export declare interface TokenResponse {
  isValid: Boolean
  data: JwtPayload
}

export default class AuthUtils {
  private handler: ITokenManager
  constructor (handler: ITokenManager) {
    this.handler = handler
  }
  public validateTokenData = (payload: JwtPayload): boolean => {
    if (
      !payload ||
      !payload.iss ||
      !payload.accessKeyId ||
      !payload.iss ||
      !payload.role
    )
      throw new Error('Invalid Access Token')
    return true
  }

  public createTokens = async (
    accessKeyIdPayload: string,
    issuePayload: string,
    rolePayload: string,
    privateKey: string
  ): Promise<UserToken> => {
    const accessToken = await this.handler.encode(
      new JwtPayload(issuePayload, rolePayload, accessKeyIdPayload),
      privateKey
    )

    if (!accessToken) throw new Error('Error creating token')

    return {
      accessToken: accessToken
    } as UserToken
  }

  public validateToken = async (
    token: UserToken,
    privateKey: string
  ): Promise<TokenResponse> => {
    let result = false
    let accessTokenData: JwtPayload
    try {
      accessTokenData = await this.handler.decode(token.accessToken, privateKey)
      result = true
    } catch (e) {
      console.log('Invalid token')
    }
    return {
      data: accessTokenData,
      isValid: result
    } as TokenResponse
  }
}
