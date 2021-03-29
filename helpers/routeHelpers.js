const joi = require("@hapi/joi")
var ObjectID = require('mongodb').ObjectID;

const IdValidator = (value, helpers) => { if (ObjectID.isValid(value) == false) { throw new Error('invalid ID'); } return value; };

module.exports = {
  validateBody: (schema, property) => {
    return async (req, res, next) => {
      let request = {}; property.filter((val) => { Object.keys(req[val]).map(values => { request[values] = req[val][values] }) });
      const result = schema.validate(request, { abortEarly: false });
      if (result.error) {
        var errors = [];
        for (var i = 0; i < result.error.details.length; i++) {
          errors.push({[result.error.details[i].path]:result.error.details[i].message});
        }
        return res.status(422).json({ success:false, statusCode:422, message: "Validation Error", errors });
      }
      if (!req.value) {
        req.value = {};
      }
      req.value["body"] = result.value;
      next();
    };
  },
  schemas: {
    signup: joi.object().keys({
      email: joi.string().email().required(),
      username: joi.string().required(),
      password: joi.string().min(6).required(),
      confirmPassword: joi.string().required().valid(joi.ref('password')).messages({ 'any.only': `Password must match Confirm Password` }),
    }),

    signin: joi.object().keys({
      email: joi.string().email().required(),
      password: joi.string().required(),
    }),

    confirm: joi.object().keys({
      ct: joi.string().required()
    }),

    resendConfirm: joi.object().keys({
      email: joi.string().required(),
    }),

    resetLink: joi.object().keys({
      email: joi.string().required(),
    }),

    passReset: joi.object().keys({
      token: joi.string().required(),
      password: joi.string().min(6).required(),
      confirmPassword: joi.string().required().valid(joi.ref('password')).messages({ 'any.only': `Password must match Confirm Password` }),
    }),

    request: joi.object().keys({
      uid: joi.string().custom(IdValidator, 'custom validation').message({ "any.custom": `invalid "{{#label}}"` })
    }),

    accept: joi.object().keys({
      uid: joi.string().custom(IdValidator, 'custom validation').message({ "any.custom": `invalid "{{#label}}"` })
    }),

    reject: joi.object().keys({
      uid: joi.string().custom(IdValidator, 'custom validation').message({ "any.custom": `invalid "{{#label}}"` })
    }),
    message: joi.object().keys({
      message: joi.string().required(),
      uid: joi.string().custom(IdValidator, 'custom validation').message({ "any.custom": `invalid "{{#label}}"` })
    }),
  }
};
