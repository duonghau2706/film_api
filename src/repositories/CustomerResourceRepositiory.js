import { CustomerResourceModel } from '@/models'
import BaseRepository from './BaseRepository'

class CustomerResourceRepositiory extends BaseRepository {
  constructor(props) {
    super(props)
    this.model = CustomerResourceModel
  }
}

export default new CustomerResourceRepositiory()
