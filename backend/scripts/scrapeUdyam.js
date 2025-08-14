/*
  Quick scraper to extract form fields for Step 1 and Step 2 and emit JSON schemas.
  Note: Selectors may need adjustment if the Udyam portal DOM changes.
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

 
function normalizeLabel(text) {
  return text.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
}

function toPatternFromPlaceholder(name, placeholder) {
  if (/pan/i.test(name) || /pan/i.test(placeholder)) return '^[A-Z]{5}[0-9]{4}[A-Z]{1}$';
  if (/aadhaar/i.test(name) || /aadhar/i.test(placeholder)) return '^\\d{12}$';
  if (/otp/i.test(name) || /otp/i.test(placeholder)) return '^\\d{6}$';
  if (/mobile/i.test(name) || /phone/i.test(placeholder)) return '^[6-9]\\d{9}$';
  return '';
}

function mapInputToField(input) {
  const name = input.name || input.id || '';
  const label = normalizeLabel(input.label || input.placeholder || name);
  const type = input.type === 'number' ? 'number' : 'text';
  const required = Boolean(input.required);
  const placeholder = input.placeholder || '';
  const pattern = input.pattern || toPatternFromPlaceholder(name, placeholder);
  const minLength = input.minLength && input.minLength > 0 ? input.minLength : undefined;
  const maxLength = input.maxLength && input.maxLength > 0 ? input.maxLength : undefined;
  return {
    name: name || label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    label,
    type,
    required,
    placeholder,
    ...(pattern ? { pattern } : {}),
    ...(minLength ? { minLength } : {}),
    ...(maxLength ? { maxLength } : {})
  };
}

async function extractStepSchema(page, step) {
  // Heuristic: narrow to a section/container by heading text
  const stepHandle = await page.$x(`//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'step ${step}') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'otp') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'pan')]`);
  const scope = stepHandle[0] || (await page.$('form'));

  const inputs = await page.evaluate((container) => {
    const root = container || document;
    function findLabelText(input) {
      let label = '';
      if (input.labels && input.labels.length) label = input.labels[0].innerText;
      if (!label && input.id) {
        const lbl = root.querySelector(`label[for="${input.id}"]`);
        if (lbl) label = lbl.innerText;
      }
      return label || input.placeholder || input.name || input.id || '';
    }
    const fieldNodes = Array.from(root.querySelectorAll('input, select'));
    return fieldNodes
      .filter((el) => !['hidden', 'submit', 'button', 'checkbox', 'radio'].includes(el.type))
      .map((el) => ({
        name: el.name || el.id || '',
        id: el.id || '',
        type: el.tagName.toLowerCase() === 'select' ? 'select' : el.type || 'text',
        placeholder: el.placeholder || '',
        required: el.required || false,
        label: findLabelText(el),
        pattern: el.pattern || '',
        minLength: el.minLength || 0,
        maxLength: el.maxLength || 0,
        options: el.tagName.toLowerCase() === 'select' ? Array.from(el.options).map((o) => o.textContent.trim()).filter(Boolean) : []
      }));
  }, scope);

  const fields = inputs.map((i) => {
    if (i.type === 'select') {
      return {
        name: i.name || i.id || i.label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        label: normalizeLabel(i.label),
        type: 'select',
        required: i.required,
        options: i.options.filter((o) => !/^select/i.test(o))
      };
    }
    return mapInputToField(i);
  });

  return {
    title: step === 1 ? 'Udyam Registration - Step 1' : 'Udyam Registration - Step 2',
    description: step === 1 ? 'Aadhaar + OTP' : 'PAN Validation',
    fields
  };
}

async function main() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });

  // If the site requires interaction to reveal steps, consider adding clicks here
  const step1 = await extractStepSchema(page, 1);
  const step2 = await extractStepSchema(page, 2);

  const outDir = path.join(__dirname, '..', 'schemas');
  fs.writeFileSync(path.join(outDir, 'step1.json'), JSON.stringify(step1, null, 2));
  fs.writeFileSync(path.join(outDir, 'step2.json'), JSON.stringify(step2, null, 2));
  console.log('Schemas written to schemas/step1.json and schemas/step2.json');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


