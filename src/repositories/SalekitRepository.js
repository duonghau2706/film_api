import { SalekitDocumentModel } from '@/models'
import BaseRepository from './BaseRepository'

class SalekitRepository extends BaseRepository {
  constructor(props) {
    super(props)
    this.model = SalekitDocumentModel
  }
}

export default new SalekitRepository()
