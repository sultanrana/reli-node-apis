import Joi from 'joi'

export default {
  validateSignupSchema(body){
        const schema = Joi.object().keys({
            email: Joi.string()
              .email()
              .required(),
            password: Joi.string()
              .optional(),
            name: Joi.string()
              .required(),
              country: Joi.string().required(),
              state: Joi.string().required(),
              city: Joi.string().required(),
              skills: Joi.string().required(),
              gender: Joi.string().required(),
              dateOfBirth: Joi.string().required(),
          });
          const { error, value } = Joi.validate(body, schema);
          if (error && error.details) {
            return { error };
          }
          return { value };
  },
  validateLoginSchema(body){
      const schema = Joi.object().keys({
          email: Joi.string()
            .email()
            .required(),
            // .label("email is required trrrr"),
          password: Joi.string()
            .required()
            // .label("email is required vfvfvf"),
        });
        const { error, value } = Joi.validate(body, schema);
        if (error && error.details) {
          return { error };
        }
        return { value };
  },
  validateChangePasswordSchema(body){
    const schema = Joi.object().keys({
        old_password: Joi.string()
          .required(),
        new_password: Joi.string()
          .min(8)
          .max(255)
          .required(),
    });
      const { error, value } = Joi.validate(body, schema);
      if (error && error.details) {
        return { error };
      }
      return { value };
  },
  validateForgotPasswordSchema(body){
    const schema = Joi.object().keys({
        email: Joi.string()
          .email()
          .required(),
      });
      const { error, value } = Joi.validate(body, schema);
      if (error && error.details) {
        return { error };
      }
      return { value };
  },
};