import Joi from 'joi'

export default {
  validateSignupSchema(body){
        const schema = Joi.object().keys({
              email: Joi.string().email().required(),
              firstName: Joi.string().optional(),
              lastName: Joi.string().optional(),
              userType: Joi.string().optional(),
              password: Joi.string().optional(),
              address: Joi.string().optional(),
              appartment: Joi.string().optional(),
              willingRange: Joi.string().optional(),
              zipCode: Joi.string().optional(),
              state: Joi.string().optional(),
              city: Joi.string().optional(),
              phoneNumber: Joi.string().optional(),
              otp: Joi.optional(),
              services: Joi.optional(),
              lat: Joi.string().optional(),
              lng: Joi.string().optional()
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
          password: Joi.string()
            .required()
        });
        const { error, value } = Joi.validate(body, schema);
        if (error && error.details) {
          return { error };
        }
        return { value };
  },
  validateChangePasswordSchema(body){
    const schema = Joi.object().keys({
        newPassword: Joi.string()
          .required(),
    });
      const { error, value } = Joi.validate(body, schema);
      if (error && error.details) {
        return { error };
      }
      return { value };
  },
  validatePhoneNumberSchema(body){
    const schema = Joi.object().keys({
        phoneNumber: Joi.string()
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