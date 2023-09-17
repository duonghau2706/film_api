import { ContactInforModel } from '@/models'
import BaseRepository from './BaseRepository'

class ContactInforRepositiory extends BaseRepository {
  constructor(props) {
    super(props)
    this.model = ContactInforModel
  }
}

export default new ContactInforRepositiory()
