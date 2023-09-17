import Joi from 'joi'
import { JoiMessage } from '@/utils/JoiUtils'

export const createSalekitDocumentValidate = (body) => {
  return Joi.object()
    .keys({
      fileName: Joi.string().required().messages(JoiMessage),
      uploadType: Joi.number().required().messages(JoiMessage),
      originalDocumentId: Joi.string()
        .allow(null)
        .allow('')
        .messages(JoiMessage),
      version: Joi.string().allow(null).allow('').messages(JoiMessage),
      languageId: Joi.string().required().messages(JoiMessage),
      documentTypeId: Joi.string().required().messages(JoiMessage),
      storageTypeId: Joi.string().required().messages(JoiMessage),
      domainId: Joi.string().required().messages(JoiMessage),
      subDomain: Joi.string().allow(null).allow('').messages(JoiMessage),
      technologyUsed: Joi.string().allow(null).allow('').messages(JoiMessage),
      languageDevelopment: Joi.string()
        .allow(null)
        .allow('')
        .messages(JoiMessage),
      hashtag: Joi.array().allow(null).allow('').messages(JoiMessage),
      description: Joi.string().allow(null).allow('').messages(JoiMessage),
      sharepointId: Joi.string().allow(null).allow('').messages(JoiMessage),
    })
    .validate(body)
}

export const updateSalekitDocumentValidate = (body) => {
  return Joi.object()
    .keys({
      id: Joi.string().required().messages(JoiMessage),
      fileName: Joi.string().required().messages(JoiMessage),
      uploadType: Joi.number().required().messages(JoiMessage),
      originalDocumentId: Joi.string()
        .allow(null)
        .allow('')
        .messages(JoiMessage),
      version: Joi.string().allow(null).allow('').messages(JoiMessage),
      languageId: Joi.string().required().messages(JoiMessage),
      documentTypeId: Joi.string().required().messages(JoiMessage),
      storageTypeId: Joi.string().required().messages(JoiMessage),
      domainId: Joi.string().required().messages(JoiMessage),
      subDomain: Joi.string().allow(null).allow('').messages(JoiMessage),
      technologyUsed: Joi.string().allow(null).allow('').messages(JoiMessage),
      languageDevelopment: Joi.string()
        .allow(null)
        .allow('')
        .messages(JoiMessage),
      hashtag: Joi.array().allow(null).allow('').messages(JoiMessage),
      description: Joi.string().allow(null).allow('').messages(JoiMessage),
    })
    .validate(body)
}

export const deleteSalekitDocumentValidate = (body) => {
  return Joi.object()
    .keys({
      id: Joi.string().required().messages(JoiMessage),
    })
    .validate(body)
}
