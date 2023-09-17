const convert2Number = (item) => +item

function toSlug(str) {
  // Chuyển hết sang chữ thường
  str = str.toLowerCase()

  // xóa dấu
  str = str
    .normalize('NFD') // chuyển chuỗi sang unicode tổ hợp
    .replace(/[\u0300-\u036F]/g, '') // xóa các ký tự dấu sau khi tách tổ hợp

  // Thay ký tự đĐ
  str = str.replace(/[đĐ]/g, 'd')

  // Xóa ký tự đặc biệt
  str = str.replace(/([^0-9a-z-\s])/g, '')

  // Xóa khoảng trắng thay bằng ký tự -
  str = str.replace(/(\s+)/g, '-')

  // Xóa ký tự - liên tiếp
  str = str.replace(/-+/g, '-')

  // xóa phần dư - ở đầu & cuối
  str = str.replace(/^-+|-+$/g, '')

  // return
  return str
}

function create_UUID() {
  var dt = new Date().getTime()
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0
      dt = Math.floor(dt / 16)
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
    }
  )
  return uuid
}

export { convert2Number, toSlug, create_UUID }
