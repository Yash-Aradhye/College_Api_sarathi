import { db } from '../../config/firebase.js';
import redis from '../config/redisClient.js';
import { CACHE_KEYS, CACHE_TTL } from '../config/constants.js';

class CutoffService {
  constructor() {
    this.collection = db.collection('cutoffs_v2');
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
    const cacheKey = `${CACHE_KEYS.CUTOFF_LIST}:${page}:${limit}:${lastDocId}`;
    try {
      // Try to get from cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

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

      const result = {
        cutoffs,
        nextPageId,
        currentPage: startAt,
        pageSize,
        hasMore: cutoffs.length === pageSize
      };

      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL.ONE_DAY, JSON.stringify(result));
      return result;
    } catch (error) {
      throw new Error(`Error getting cutoffs: ${error.message}`);
    }
  }

  async getCutoffById(id) {
    const cacheKey = `${CACHE_KEYS.CUTOFF_DETAIL}${id}`;
    try {
      // Try to get from cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        throw new Error('Cutoff not found');
      }
      const result = { id: doc.id, ...doc.data() };

      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL.ONE_HOUR, JSON.stringify(result));
      return result;
    } catch (error) {
      throw new Error(`Error getting cutoff: ${error.message}`);
    }
  }
  
  async getCutoffByInstituteCode(code) {
    try {
      const snapshot = await this.collection.where('instituteCode', '==', parseInt(code)).get();
      if (!snapshot.docs.length) {
        throw new Error('Cutoff not found');
      }
      return { total:snapshot.docs.length ,data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
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

      console.log(criteria);
      

      if (criteria.collegeId) {
        query = query.where('instituteCode', '==', criteria.collegeId);
      }
      // if (criteria.year) {
      //   query = query.where('year', '==', criteria.year);
      // }
      if (criteria.round) {
        query = query.where('capRound', '==', criteria.round);
      }
      if (criteria.category) {
        query = query.where('Category', '==', criteria.category);
      }

      const snapshot = await query.get();
      console.log(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
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
