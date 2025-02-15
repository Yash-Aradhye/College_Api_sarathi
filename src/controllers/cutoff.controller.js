import CutoffService from '../services/cutoff.service.js';

class CutoffController {
  async addCutoff(req, res) {
    try {
      const cutoff = await CutoffService.addCutoff(req.body);
      res.status(201).json(cutoff);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllCutoffs(req, res) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const lastDocId = req.query.lastDocId || null;

      const result = await CutoffService.getAllCutoffs(page, limit, lastDocId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCutoffById(req, res) {
    try {
      const cutoff = await CutoffService.getCutoffById(req.params.id);
      res.status(200).json(cutoff);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateCutoff(req, res) {
    try {
      const cutoff = await CutoffService.updateCutoff(req.params.id, req.body);
      res.status(200).json(cutoff);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCutoff(req, res) {
    try {
      const result = await CutoffService.deleteCutoff(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchCutoffs(req, res) {
    try {
      const cutoffs = await CutoffService.searchCutoffs(req.query);
      res.status(200).json(cutoffs);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CutoffController();
