import Joi from 'joi'
import { JoiMessage, JoiMessageVN } from '@/utils/JoiUtils'

export const createCustomerByExcelValidate = (body) => {
  return Joi.object()
    .keys({
      id: Joi.string().required().messages({
        'string.base': 'id phải là chuỗi',
        'string.empty': 'id trống',
      }),
      name: Joi.string().required().messages({
        'string.base': 'Tên KH (JP) phải là chuỗi',
        'string.empty': 'Tên KH (JP) trống',
      }),
      url: Joi.string().uri().allow(null).allow('').messages({
        'string.base': 'url phải là chuỗi',
        'string.uri': 'Định dạng địa chỉ url không chính xác.',
      }),
      email: Joi.string().email().allow(null).allow('').messages({
        'string.base': 'email phải là chuỗi',
        'string.email': 'Định dạng địa chỉ email không chính xác.',
      }),
      fieldName: Joi.string().allow(null).allow('').messages({
        'string.base': 'Lĩnh vực phải là chuỗi',
      }),
      romajiName: Joi.string().allow(null).allow('').messages({
        'string.base': 'Tên khách hàng(Romanji) phải là chuỗi',
      }),
      type: Joi.string().allow(null).allow('').valid('0', '1').messages({
        'string.base': 'Loại phải là chuỗi',
        'any.only': 'Loại không tồn tại',
      }),
      size: Joi.string().allow(null).allow('').valid('0', '1', '2').messages({
        'string.base': 'Size công ty phải là chuỗi',
        'any.only': 'Size công ty không tồn tại',
      }),
      typeOfCustomer: Joi.string()
        .allow(null)
        .allow('')
        .valid('1', '2', '3')
        .messages({
          'string.base': 'Phân loại khách hàng phải là chuỗi',
          'any.only': 'Phân loại khách hàng  phải là  1, 2,3',
        }),

      reason: Joi.string()
        .allow(null)
        .allow('')
        .valid('1', '2', '3', '4', '5', '6')
        .messages({
          'string.base': 'Lý do phải là chuỗi',
          'any.only': 'Lý do Blacklist phải là  1,2,3,4,5,6',
        }),
      frequencyOfEmail: Joi.string()
        .allow(null)
        .allow('')
        .valid('1', '2', '3', '4', '5')
        .messages({
          'string.base': 'Tần suất gửi mail phải là chuỗi',
          'any.only': 'Tần suất gửi mail  phải là  1, 2,3,4,5',
        }),
      address: Joi.string().allow(null).allow('').messages({
        'string.base': 'Trụ sở phải là chuỗi',
      }),
      revenue: Joi.number().allow(null).allow('').messages({
        'number.base': 'Doanh thu phải là số',
      }),
      investment: Joi.number().allow(null).allow('').messages({
        'number.base': 'Vốn đầu tư phải là số',
      }),
      note: Joi.string().allow(null).allow('').messages({
        'string.base': 'Ghi chú phải là chuỗi',
      }),
      customerResourceId: Joi.string().required().messages({
        'string.base': 'Nguồn khách hàng phải là chuỗi',
        'string.empty': 'Nguồn khách hàng không được để trống',
        'string.required': 'Nguồn khách hàng không được để trống',
      }),
    })
    .validate(body)
}

export const asignCustomerByUser = (body) => {
  return Joi.object()
    .keys({
      data: Joi.array()
        .items({
          id: Joi.string().required().messages(JoiMessage),
          personInChargeId: Joi.string().required().messages(JoiMessage),
        })
        .required()
        .messages(JoiMessage),
    })
    .validate(body)
}

export const updateFrequencyEmail = (body) => {
  return Joi.object()
    .keys({
      data: Joi.array()
        .items({
          id: Joi.string().required().messages(JoiMessage),
          frequencyOfEmail: Joi.string()
            .valid('1', '2', '3', '4', '5')
            .messages({
              'string.base': 'Tần suất gửi mail phải là chuỗi',
              'any.only': 'Tần suất gửi mail  phải là  1, 2,3,4,5',
            }),
        })
        .required()
        .messages(JoiMessage),
    })
    .validate(body)
}

export const validateEmail = (body) => {
  return Joi.object()
    .keys({
      email: Joi.string().email().required().messages({
        'string.base': 'email không được để trống',
        'string.email': 'Định dạng địa chỉ email không chính xác.',
      }),
    })
    .validate(body)
}
