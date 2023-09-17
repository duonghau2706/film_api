import Joi from 'joi'
import { JoiMessage } from '@/utils/JoiUtils'

export const createCustomerResourceValidate = (body) => {
  return Joi.object()
    .keys({
      name: Joi.string().required().messages(JoiMessage),
      fieldName: Joi.string().allow(null).allow('').messages(JoiMessage),
      note: Joi.string().allow(null).allow('').messages(JoiMessage),
      url: Joi.string().allow(null).allow('').messages(JoiMessage),
      createdBy: Joi.string().allow(null).allow('').messages(JoiMessage),
      updatedBy: Joi.string().allow(null).allow('').messages(JoiMessage),
    })
    .validate(body)
}

export const updateCustomerResourceValidate = (body) => {
  return Joi.object()
    .keys({
      id: Joi.string().required().messages(JoiMessage),
      name: Joi.string().required().messages(JoiMessage),
      fieldName: Joi.string().allow(null).allow('').messages(JoiMessage),
      note: Joi.string().allow(null).allow('').messages(JoiMessage),
      url: Joi.string().allow(null).allow('').messages(JoiMessage),
      updatedBy: Joi.string().allow(null).allow('').messages(JoiMessage),
    })
    .validate(body)
}

export const findByIdCustomerResourceValidate = (body) => {
  return Joi.object()
    .keys({
      id: Joi.string().required().messages(JoiMessage),
    })
    .validate(body)
}
