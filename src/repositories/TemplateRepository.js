import { TemplateModel } from '@/models'
import BaseRepository from './BaseRepository'

class TemplateRepository extends BaseRepository {
  constructor(props) {
    super(props)
    this.model = TemplateModel
  }
}

export default new TemplateRepository()
