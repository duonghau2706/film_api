import { ImportCustomerHistoriesModel } from '@/models'
import BaseRepository from './BaseRepository'

class ImportCustomerHistoryRepository extends BaseRepository {
  constructor(props) {
    super(props)
    this.model = ImportCustomerHistoriesModel
  }
}

export default new ImportCustomerHistoryRepository()
