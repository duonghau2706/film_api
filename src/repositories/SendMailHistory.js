import { SentMailHistoryModel } from '@/models'
import BaseRepository from './BaseRepository'

class SendMailHistoryRepository extends BaseRepository {
  constructor(props) {
    super(props)
    this.model = SentMailHistoryModel
  }
}

export default new SendMailHistoryRepository()
