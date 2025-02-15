import CollegeService from '../services/college.service.js';

class CollegeController {
  // Add new college
  async addCollege(req, res) {
    try {
      const college = await CollegeService.addCollege(req.body);
      res.status(201).json(college);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get all colleges
  async getAllColleges(req, res) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const lastDocId = req.query.lastDocId || null;

      const result = await CollegeService.getAllColleges(page, limit, lastDocId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get college by ID
  async getCollegeById(req, res) {
    try {
      const college = await CollegeService.getCollegeById(req.params.id);
      res.status(200).json(college);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Update college
  async updateCollege(req, res) {
    try {
      const college = await CollegeService.updateCollege(req.params.id, req.body);
      res.status(200).json(college);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete college
  async deleteCollege(req, res) {
    try {
      const result = await CollegeService.deleteCollege(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Search colleges
  async searchColleges(req, res) {
    try {
      const searchCriteria = {
        ...req.query,
        page: req.query.page || 1,
        limit: req.query.limit || 10
      };
      
      const result = await CollegeService.searchColleges(searchCriteria);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CollegeController();