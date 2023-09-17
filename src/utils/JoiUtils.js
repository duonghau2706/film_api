export const JoiMessage = {
  'number.base': '{{#label}} must be a number',
  'number.greater': '{{#label}} must be greater than {{#limit}}',
  'number.infinity': '{{#label}} cannot be infinity',
  'number.integer': '{{#label}} must be an integer',
  'number.less': '{{#label}} must be less than {{#limit}}',
  'number.max': '{{#label}} must be less than or equal to {{#limit}}',
  'number.min': '{{#label}} must be greater than or equal to {{#limit}}',
  'number.multiple': '{{#label}} must be a multiple of {{#multiple}}',
  'number.negative': '{{#label}} must be a negative number',
  'number.port': '{{#label}} must be a valid port',
  'number.positive': '{{#label}} must be a positive number',
  'number.precision':
    '{{#label}} must have no more than {{#limit}} decimal places',
  'number.unsafe': '{{#label}} must be a safe number',
  'number.role': '{{#label}} must be a safe number',
  'string.alphanum': '{{#label}} must only contain alpha-numeric characters',
  'string.base': '{{#label}} must be a string',
  'string.base64': '{{#label}} must be a valid base64 string',
  'string.creditCard': '{{#label}} must be a credit card',
  'string.dataUri': '{{#label}} must be a valid dataUri string',
  'string.domain': '{{#label}} must contain a valid domain name',
  'string.email': 'The email address format is incorrect.',
  'string.empty': '{{#label}} empty',
  'string.guid': '{{#label}} must be a valid GUID',
  'string.hex': '{{#label}} must only contain hexadecimal characters',
  'string.hexAlign':
    '{{#label}} hex decoded representation must be byte aligned',
  'string.hostname': '{{#label}} must be a valid hostname',
  'string.ip': '{{#label}} must be a valid ip address with a {{#cidr}} CIDR',
  'string.ipVersion':
    '{{#label}} must be a valid ip address of one of the following versions {{#version}} with a {{#cidr}} CIDR',
  'string.isoDate': '{{#label}} must be in iso format',
  'string.isoDuration': '{{#label}} must be a valid ISO 8601 duration',
  'string.length': '{{#label}} length must be {{#limit}} characters long',
  'string.lowercase': '{{#label}} must only contain lowercase characters',
  'string.max': '{{#label}} must be {{#limit}} characters or less',
  'string.min': '{{#label}} must be at least {{#limit}} characters',
  'string.normalize':
    '{{#label}} must be unicode normalized in the {{#form}} form',
  'string.token':
    '{{#label}} must only contain alpha-numeric and underscore characters',
  'string.pattern.base': 'The password format is incorrect.',
  'string.pattern.name':
    '{{#label}} with value {:[.]} fails to match the {{#name}} pattern',
  'string.pattern.invert.base':
    '{{#label}} with value {:[.]} matches the inverted pattern: {{#regex}}',
  'string.pattern.invert.name':
    '{{#label}} with value {:[.]} matches the inverted {{#name}} pattern',
  'string.trim': '{{#label}} must not have leading or trailing whitespace',
  'string.uri': '{{#label}} must be a valid uri',
  'string.uriCustomScheme':
    '{{#label}} must be a valid uri with a scheme matching the {{#scheme}} pattern',
  'string.uriRelativeOnly': '{{#label}} must be a valid relative uri',
  'string.uppercase': '{{#label}} must only contain uppercase characters',
  array: '{{#label}} must be a array',
  'any.required': '{{#label}} is required',
}

export const JoiMessageVN = {
  'number.base': '{{#label}} phải là số',
  'number.greater': '{{#label}} phải lớn hơn {{#limit}}',
  'number.infinity': '{{#label}} không thể là vô hạn',
  'number.integer': '{{#label}} phải là số',
  'number.less': '{{#label}} phải bé hơn {{#limit}}',
  'number.max': '{{#label}} phải bé hơn hoặc bằng {{#limit}}',
  'number.min': '{{#label}} phải lớn hơn hoặc bằng {{#limit}}',
  'number.multiple': '{{#label}} phải là bội số của {{#multiple}}',
  'number.negative': '{{#label}} phải là số âm',
  'number.port': '{{#label}} phải là một cổng hợp lệ',
  'number.positive': '{{#label}} phải là một cổng hợp lệ',
  'number.precision':
    '{{#label}} không được có nhiều hơn {{#limit}} chữ số thập phân',
  'number.unsafe': '{{#label}} phải là một số an toàn',
  'number.role': '{{#label}} phải là một số an toàn',
  'string.alphanum': '{{#label}} chỉ được chứa các ký tự chữ và số',
  'string.base': '{{#label}} phải là chuỗi',
  'string.base64': '{{#label}} phải là một chuỗi base64 hợp lệ',
  'string.creditCard': '{{#label}} phải là thẻ tín dụng',
  'string.dataUri': '{{#label}} phải là một chuỗi dataUri hợp lệ',
  'string.domain': '{{#label}} phải chứa một tên miền hợp lệ',
  'string.email': 'Định dạng địa chỉ email không chính xác.',
  'string.empty': '{{#label}} trống',
  'string.guid': '{{#label}} phải là một GUID hợp lệ',
  'string.hex': '{{#label}} chỉ được chứa các ký tự thập lục phân',
  'string.hexAlign':
    '{{#label}} đại diện được giải mã hex phải được căn chỉnh theo byte',
  'string.hostname': '{{#label}} phải là một tên máy chủ hợp lệ',
  'string.ip':
    '{{#label}} phải là một địa chỉ ip hợp lệ với một {{#cidr}} CIDR',
  'string.ipVersion':
    '{{#label}} phải là địa chỉ IP hợp lệ của một trong các phiên bản sau {{#version}} với một {{#cidr}} CIDR',
  'string.isoDate': '{{#label}} phải ở định dạng iso',
  'string.isoDuration': '{{#label}} phải có thời lượng ISO 8601 hợp lệ',
  'string.length': '{{#label}} chiều dài phải là {{#limit}} kí tự dài',
  'string.lowercase': '{{#label}} chỉ được chứa các ký tự chữ thường',
  'string.max': '{{#label}} cần phải có {{#limit}} ký tự hoặc ít hơn',
  'string.min': '{{#label}} phải ít nhất {{#limit}} ký tự',
  'string.normalize':
    '{{#label}} phải được chuẩn hóa unicode trong {{#form}} form',
  'string.token':
    '{{#label}} chỉ được chứa các ký tự chữ và số và dấu gạch dưới',
  'string.pattern.base': 'Định dạng mật khẩu không chính xác',
  'string.pattern.name':
    '{{#label}} with value {:[.]} không phù hợp với {{#name}} mẫu',
  'string.pattern.invert.base':
    '{{#label}} with value {:[.]} phù hợp với mô hình đảo ngược: {{#regex}}',
  'string.pattern.invert.name':
    '{{#label}} with value {:[.]} phù hợp với đảo ngược {{#name}} mẫu',
  'string.trim': '{{#label}} không được có khoảng trắng ở đầu hoặc cuối',
  'string.uri': '{{#label}} phải là một uri hợp lệ',
  'string.uriCustomScheme':
    '{{#label}} phải là một uri hợp lệ với lược đồ phù hợp với {{#scheme}} mẫu',
  'string.uriRelativeOnly': '{{#label}} phải là một uri tương đối hợp lệ',
  'string.uppercase': '{{#label}} chỉ được chứa các ký tự viết hoa',
  array: '{{#label}} phải là mảng',
  'any.required': '{{#label}} bắt buộc',
}
