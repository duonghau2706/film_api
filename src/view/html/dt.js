document.querySelector('#huhu').innerHTML = 'dsadan'
document.addEventListener('DOMContentLoaded', function () {
  // Gửi yêu cầu API
  fetch('http://localhost:3000/api/v1/report/pdf')
    .then((response) => response.json())
    .then((data) => {
      console.log('data', data)
      // Lấy thẻ tbody của bảng
      const tableBody = document
        .getElementById('apiDataTable')
        .getElementsByTagName('tbody')[0]
      // Điền dữ liệu vào bảng
      data.forEach((item) => {
        const row = tableBody.insertRow()
        const cell1 = row.insertCell(0)
        const cell2 = row.insertCell(1)
        // Điền dữ liệu từ item vào các ô
        cell1.textContent = item.id
        cell2.textContent = item.name
        // Thêm các dòng khác tùy thuộc vào cấu trúc dữ liệu từ API
      })
    })
    .catch((error) => console.error('Error fetching data:', error))
})
