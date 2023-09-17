import BaseRepository from './BaseRepository'
import { EffortMemberModel } from '@/models'

class EffortMemberRepository extends BaseRepository {
  constructor(props) {
    super(props)
    this.model = EffortMemberModel
  }
}

export default new EffortMemberRepository()
