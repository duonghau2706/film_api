export const element = ({ totalRecord, page, limit }) => {
  const totalPage =
    totalRecord % limit === 0
      ? totalRecord / limit
      : Math.floor(totalRecord / limit) + 1
  // if totalPage = 0 then  page = 1
  page = page > totalPage ? (totalPage === 0 ? 1 : totalPage) : page
  const offset = page !== 0 ? (page - 1) * limit : page
  return { totalPage, page, offset }
}
