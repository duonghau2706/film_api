import { Constants } from '@/utils/Constants'

export default class BaseRepository {
  constructor() {}

  // data obj
  async create(data, transaction = null) {
    const trans = { transaction: transaction ?? null }
    return await this.model.create(data, trans)
  }

  // data arr
  async createList(data) {
    return await this.model.bulkCreate(data)
  }

  // data arr
  async updateList(data) {
    return await this.model.bulkCreate(data, { updateOnDuplicate: fields })
  }

  async update({ data, option }, transaction = null) {
    const trans = transaction ? { transaction: transaction } : {}
    let result = {}
    const dataUpdate = await this.model.update(data, {
      where: option,
      returning: true,
      ...trans,
    })
    if (dataUpdate.length >= 2) {
      result = dataUpdate[1]
    }
    return result
  }

  async delete(option) {
    return await this.model.destroy({
      where: option,
    })
  }

  async deleteWithTransaction(option, transaction = null) {
    const trans = transaction ? { transaction: transaction } : {}
    return await this.model.destroy({
      where: option,
      ...trans,
    })
  }

  async findAll(option, includeOpts = null, order = null) {
    const allOption = { ...option }
    let listOrderBy = []
    if (order) {
      listOrderBy = this.addListOrderBy(order)
    } else {
      listOrderBy.push(['created_at', 'desc'])
    }

    return await this.model.findAll({
      where: allOption,
      ...(includeOpts && includeOpts?.length ? { include: includeOpts } : {}),
      order: listOrderBy,
    })
  }

  async findAllWithOrders(option, orders, includeOpts = null) {
    const allOption = { ...option }
    return await this.model.findAll({
      where: allOption,
      ...(includeOpts && includeOpts?.length ? { include: includeOpts } : {}),
      order: [...orders],
    })
  }

  async findOne(option, includeOpts = null) {
    const allOption = { ...option }
    return await this.model.findOne({
      where: allOption,
      ...(includeOpts && includeOpts?.length ? { include: includeOpts } : {}),
    })
  }

  // find by [primary key]
  async findByPk(pk) {
    return await this.model.findByPk(pk)
  }

  async getCountItems(option, includeOpts = null) {
    const allOption = { ...option }
    const countAll = await this.model.findAndCountAll({
      where: allOption,
      ...(includeOpts ? { include: includeOpts } : {}),
    })

    return countAll?.rows?.length ?? countAll.count
  }

  async getCountItemsAll(option, includeOpts = null) {
    const countAll = await this.model.findAndCountAll({
      where: option,
      ...(includeOpts ? { include: includeOpts } : {}),
    })

    return countAll?.rows?.length ?? countAll.count
  }

  async paginate({ limit, page, options, order }, includeOpts = null) {
    const allOption = { ...options }
    const count = await this.getCountItems(allOption, includeOpts)
    const perPage = limit && parseInt(limit) > 0 ? parseInt(limit) : count
    let currentPage = page && page > 0 ? page : 1
    const totalPage = Math.ceil(count / perPage)
    currentPage =
      currentPage > totalPage && totalPage > 0 ? totalPage : currentPage
    const skip = (currentPage - 1) * perPage

    const elements = await this.model.findAndCountAll({
      where: allOption,
      ...(includeOpts && includeOpts?.length ? { include: includeOpts } : {}),
      limit: perPage,
      order: this.addListOrderBy(order),
      offset: skip,
    })
    return {
      elements: elements.rows,
      paginate: {
        page: parseInt(currentPage),
        size: perPage,
        totalPage: totalPage,
        totalRecord: count,
        // sortKey: order.sortKey,
        // sortDir: order.sortDir
      },
    }
  }

  async paginateAll({ limit, page, options, order }, includeOpts = null) {
    const count = await this.getCountItemsAll(options, includeOpts)
    const perPage = limit && parseInt(limit) > 0 ? parseInt(limit) : count
    let currentPage = page && page > 0 ? page : 1
    const totalPage = Math.ceil(count / perPage)
    currentPage =
      currentPage > totalPage && totalPage > 0 ? totalPage : currentPage
    const skip = (currentPage - 1) * perPage

    const elements = await this.model.findAndCountAll({
      where: options,
      ...(includeOpts && includeOpts?.length ? { include: includeOpts } : {}),
      limit: perPage,
      order: this.addListOrderBy(order),
      offset: skip,
    })
    return {
      elements: elements.rows,
      paginate: {
        page: parseInt(currentPage),
        size: perPage,
        totalPage: totalPage,
        totalRecord: count,
        // sortKey: order.sortKey,
        // sortDir: order.sortDir
      },
    }
  }

  addListOrderBy(order) {
    const listOrderBy = []
    //add list sort
    if (Array.isArray(order)) {
      order.forEach((o) => {
        listOrderBy.push([o.sortKey, o.sortDir])
      })
    } else {
      listOrderBy.push([order.sortKey, order.sortDir])
    }
    listOrderBy.push(['id', 'desc'])

    return listOrderBy
  }

  async paginateUsersAdmin(
    { limit, page, options, orders },
    includeOpts = null
  ) {
    const allOption = { ...options }
    const count = await this.getCountItems(allOption, includeOpts)
    const perPage = limit && parseInt(limit) > 0 ? parseInt(limit) : count
    let currentPage = page && page > 0 ? page : 1
    const totalPage = Math.ceil(count / perPage)
    currentPage =
      currentPage > totalPage && totalPage > 0 ? totalPage : currentPage
    const skip = (currentPage - 1) * perPage

    // add condition sort
    orders = [...orders, ['id', 'DESC']]

    const elements = await this.model.findAndCountAll({
      where: allOption,
      limit: perPage,
      order: orders,
      ...(includeOpts ? { include: includeOpts } : {}),
      offset: skip,
    })
    return {
      elements: elements.rows,
      paginate: {
        page: parseInt(currentPage),
        size: perPage,
        totalPage: totalPage,
        totalRecord: count,
        // sortKey: order.sortKey,
        // sortDir: order.sortDir
      },
    }
  }
}
