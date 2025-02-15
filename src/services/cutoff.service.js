import { db } from '../../config/firebase.js';

class CutoffService {
  constructor() {
    this.collection = db.collection('cutoffs');
  }

  async addCutoff(cutoffData) {
    try {
      if (cutoffData.id) {
        await this.collection.doc(cutoffData.id).set(cutoffData);
        return { id: cutoffData.id, ...cutoffData };
      } else {
        const docRef = await this.collection.add(cutoffData);
        return { id: docRef.id, ...cutoffData };
      }
    } catch (error) {
      throw new Error(`Error adding cutoff: ${error.message}`);
    }
  }

  async getAllCutoffs(page = 1, limit = 10, lastDocId = null) {
    try {
      let query = this.collection;
      const pageSize = parseInt(limit);
      const startAt = parseInt(page);

      
      query =  query
      .orderBy('year', 'desc')
      .limit(pageSize)
      
      if (lastDocId) {
        const lastDoc = await this.collection.doc(lastDocId).get();
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();

      const cutoffs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const nextPageId = lastVisible ? lastVisible.id : null;

      return {
        cutoffs,
        nextPageId,
        currentPage: startAt,
        pageSize,
        hasMore: cutoffs.length === pageSize
      };
    } catch (error) {
      throw new Error(`Error getting cutoffs: ${error.message}`);
    }
  }

  async getCutoffById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        throw new Error('Cutoff not found');
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting cutoff: ${error.message}`);
    }
  }

  async updateCutoff(id, updateData) {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('Cutoff not found');
      }
      
      await docRef.update(updateData);
      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      throw new Error(`Error updating cutoff: ${error.message}`);
    }
  }

  async deleteCutoff(id) {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('Cutoff not found');
      }
      
      await docRef.delete();
      return { id, message: 'Cutoff deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting cutoff: ${error.message}`);
    }
  }

  async searchCutoffs(criteria) {
    try {
      let query = this.collection;

      if (criteria.collegeId) {
        query = query.where('collegeId', '==', criteria.collegeId);
      }
      if (criteria.year) {
        query = query.where('year', '==', criteria.year);
      }
      if (criteria.round) {
        query = query.where('round', '==', criteria.round);
      }
      if (criteria.category) {
        query = query.where('category', '==', criteria.category);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error searching cutoffs: ${error.message}`);
    }
  }
}

export default new CutoffService();
