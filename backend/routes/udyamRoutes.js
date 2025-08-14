import { Router } from 'express';
import { getStep1Schema, getStep2Schema, validateStep1, validateStep2, submit } from '../controllers/udyamController.js';

const router = Router();

router.get('/schema/step1', getStep1Schema);
router.get('/schema/step2', getStep2Schema);
router.post('/validate/step1', validateStep1);
router.post('/validate/step2', validateStep2);
router.post('/submit', submit);

export default router;


