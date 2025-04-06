import { Router } from 'express';
import cutoffController from '../controllers/cutoff.controller.js';

const router = Router();

router.post('/', cutoffController.addCutoff);
router.get('/', cutoffController.getAllCutoffs);
router.get('/search', cutoffController.searchCutoffs);
router.get('/institute/:instituteCode', cutoffController.getCutoffByInstituteCode);
router.get('/:id', cutoffController.getCutoffById);
router.put('/:id', cutoffController.updateCutoff);
router.delete('/:id', cutoffController.deleteCutoff);

export default router;
