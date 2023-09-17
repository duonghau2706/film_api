import Joi from 'joi'
import { JoiMessage } from '@/utils/JoiUtils'

export const createTemplateValidate = (body) => {
  return Joi.object()
    .keys({
      templateName: Joi.string().required().messages(JoiMessage),
      title: Joi.string().required().messages(JoiMessage),
      content: Joi.string().required().messages(JoiMessage),
      styles: Joi.string().allow(null).allow('').messages(JoiMessage),
      numberOfCharacters: Joi.number()
        .allow(null)
        .allow('')
        .messages(JoiMessage),
      note: Joi.string().allow(null).allow('').messages(JoiMessage),
      createdBy: Joi.string().allow(null).allow('').messages(JoiMessage),
      updatedBy: Joi.string().allow(null).allow('').messages(JoiMessage),
    })
    .validate(body)
}

export const updateTemplateValidate = (body) => {
  return Joi.object()
    .keys({
      id: Joi.string().required().messages(JoiMessage),
      templateName: Joi.string().required().messages(JoiMessage),
      title: Joi.string().required().messages(JoiMessage),
      content: Joi.string().required().messages(JoiMessage),
      styles: Joi.string().allow(null).allow('').messages(JoiMessage),
      numberOfCharacters: Joi.number()
        .allow(null)
        .allow('')
        .messages(JoiMessage),
      note: Joi.string().allow(null).allow('').messages(JoiMessage),
      updatedBy: Joi.string().allow(null).allow('').messages(JoiMessage),
    })
    .validate(body)
}

export const findByIdValidate = (body) => {
  return Joi.object()
    .keys({
      id: Joi.string().required().messages(JoiMessage),
    })
    .validate(body)
}
