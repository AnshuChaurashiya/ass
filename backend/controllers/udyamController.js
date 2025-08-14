import Joi from 'joi';
import { saveSubmission } from '../repositories/udyamRepository.js';
// Simple inline schemas to avoid filesystem dependency
const step1SchemaJson = {
  title: 'Aadhaar Verification',
  description: 'Enter Aadhaar details to receive OTP',
  fields: [
    {
      name: 'nameOnAadhaar',
      label: 'Name (as per Aadhaar)',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    {
      name: 'aadhaarNumber',
      label: 'Aadhaar Number',
      type: 'text',
      required: true,
      pattern: '^\\d{12}$',
      minLength: 12,
      maxLength: 12,
    },
    {
      name: 'mobileNumber',
      label: 'Mobile Number',
      type: 'text',
      required: true,
      pattern: '^[6-9]\\d{9}$',
      minLength: 10,
      maxLength: 10,
    },
    {
      name: 'otp',
      label: 'OTP',
      type: 'text',
      required: false,
      pattern: '^\\d{6}$',
      minLength: 6,
      maxLength: 6,
    },
  ],
};

const step2SchemaJson = {
  title: 'PAN & Business Details',
  description: 'Provide PAN and basic business details',
  fields: [
    {
      name: 'panNumber',
      label: 'PAN Number',
      type: 'text',
      required: true,
      pattern: '^[A-Z]{5}[0-9]{4}[A-Z]$'
    },
    {
      name: 'businessName',
      label: 'Business Name',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    {
      name: 'businessType',
      label: 'Business Type',
      type: 'select',
      required: true,
      options: ['Proprietorship', 'Partnership', 'LLP', 'Private Limited'],
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      required: true,
      pattern: '^[^\n\r\t@\s]+@[^\n\r\t@\s]+\\.[^\n\r\t@\s]+$'
    },
  ],
};

function buildJoiSchema(schemaJson) {
  const shape = {};
  for (const field of schemaJson.fields) {
    let rule = Joi.any();
    switch (field.type) {
      case 'text':
        rule = Joi.string();
        break;
      case 'number':
        rule = Joi.number();
        break;
      case 'select':
        rule = Joi.string().valid(...(field.options || []));
        break;
      default:
        rule = Joi.any();
    }
    if (field.pattern) {
      rule = Joi.string().pattern(new RegExp(field.pattern));
    }
    if (typeof field.minLength === 'number') {
      rule = Joi.string().min(field.minLength);
    }
    if (typeof field.maxLength === 'number') {
      rule = Joi.string().max(field.maxLength);
    }
    if (field.required) {
      rule = rule.required();
    } else {
      rule = rule.allow('', null);
    }
    shape[field.name] = rule.label(field.label || field.name);
  }
  return Joi.object(shape);
}

const step1Validator = buildJoiSchema(step1SchemaJson);
const step2Validator = buildJoiSchema(step2SchemaJson);

export function getStep1Schema(req, res) {
  res.json(step1SchemaJson);
}

export function getStep2Schema(req, res) {
  res.json(step2SchemaJson);
}

export function validateStep1(req, res) {
  const { error, value } = step1Validator.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map((d) => ({ field: d.context.key, message: d.message })) });
  }
  res.json({ ok: true, data: value });
}

export function validateStep2(req, res) {
  const { error, value } = step2Validator.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map((d) => ({ field: d.context.key, message: d.message })) });
  }
  res.json({ ok: true, data: value });
}

export async function submit(req, res) {
  const { step1, step2 } = req.body || {};
  const v1 = step1Validator.validate(step1 || {}, { abortEarly: false });
  const v2 = step2Validator.validate(step2 || {}, { abortEarly: false });

  const errors = [];
  if (v1.error) errors.push(...v1.error.details.map((d) => ({ step: 1, field: d.context.key, message: d.message })));
  if (v2.error) errors.push(...v2.error.details.map((d) => ({ step: 2, field: d.context.key, message: d.message })));
  if (errors.length > 0) return res.status(400).json({ errors });

  const documentToSave = { ...v1.value, ...v2.value, createdAt: new Date() };

  try {
    const saved = await saveSubmission(documentToSave);
    return res.status(201).json({ ok: true, id: saved.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save submission' });
  }
}


