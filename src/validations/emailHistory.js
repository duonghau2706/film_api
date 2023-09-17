import { JoiMessage } from '@/utils/JoiUtils'
import Joi from 'joi'

export const findByIdValidateEmail = (body) => {
  return Joi.object()
    .keys({
      id: Joi.string().required().messages(JoiMessage),
    })
    .validate(body)
}

export const updateEmailHistoryValidate = (body) => {
  return Joi.object()
    .keys({
      id: Joi.string().required().messages(JoiMessage),
      schedule: Joi.string().allow(null).allow('').messages(JoiMessage),
      response: Joi.string().allow(null).allow('').messages(JoiMessage),
      updatedBy: Joi.string().allow(null).allow('').messages(JoiMessage),
    })
    .validate(body)
}
