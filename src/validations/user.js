import Joi from 'joi'
import { JoiMessage } from '@/utils/JoiUtils'

export const updateUserValidate = (body) => {
  return Joi.object()
    .keys({
      role: Joi.number().required().valid(0, 1, 2).messages(JoiMessage),
    })
    .validate(body)
}

export const findByIdUserValidate = (body) => {
  return Joi.object()
    .keys({
      id: Joi.string().required().messages(JoiMessage),
    })
    .validate(body)
}
