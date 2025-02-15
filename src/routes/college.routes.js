import { Router } from 'express';
import collegeController from '../controllers/college.controller.js';

const router = Router();

// College routes
router.post('/', collegeController.addCollege);
router.get('/', collegeController.getAllColleges);
router.get('/search', collegeController.searchColleges);
router.get('/:id', collegeController.getCollegeById);
router.put('/:id', collegeController.updateCollege);
router.delete('/:id', collegeController.deleteCollege);

export default router;