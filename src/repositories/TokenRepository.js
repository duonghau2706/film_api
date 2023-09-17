import BaseRepository from './BaseRepository'
import { TokenModel } from '@/models'

class TokenRepository extends BaseRepository {
  constructor(props) {
    super(props)
    this.model = TokenModel
  }
}

export default new TokenRepository()
