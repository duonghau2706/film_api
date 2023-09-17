import BaseRepository from './BaseRepository'
import { CustomerModel } from '@/models'

class CustomerRepository extends BaseRepository {
  constructor(props) {
    super(props)
    this.model = CustomerModel
  }
}

export default new CustomerRepository()
