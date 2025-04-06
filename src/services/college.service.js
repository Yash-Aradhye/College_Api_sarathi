import { db } from '../../config/firebase.js';
import redis from '../config/redisClient.js';
import { CACHE_KEYS, CACHE_TTL } from '../config/constants.js';

class CollegeService {
  constructor() {
    this.collection = db.collection('colleges_v3');
  }

  // Add a new college
  async addCollege(collegeData) {
    try {
      if (collegeData.id) {
        await this.collection.doc(collegeData.id).set(collegeData);
        return { id: collegeData.id, ...collegeData };
      } else {
        const docRef = await this.collection.add(collegeData);
        return { id: docRef.id, ...collegeData };
      }
    } catch (error) {
      throw new Error(`Error adding college: ${error.message}`);
    }
  }

  // Get all colleges
  async getAllColleges(page = 1, limit = 10, lastDocId = null) {
    const cacheKey = `${CACHE_KEYS.COLLEGE_LIST}:${page}:${limit}:${lastDocId}`;
    try {
      // Try to get from cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // If not in cache, get from database
      let query = this.collection;
      const pageSize = parseInt(limit);
      const startAt = parseInt(page);

      
      query = query
      .orderBy('instituteCode')
      .limit(pageSize)
      
      
      if (lastDocId) {
        const lastDoc = await this.collection.doc(lastDocId).get();
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();
      
      const colleges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const nextPageId = lastVisible ? lastVisible.id : null;

      const result = {
        colleges,
        nextPageId,
        currentPage: startAt,
        pageSize,
        hasMore: colleges.length === pageSize
      };

      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL.ONE_DAY, JSON.stringify(result));
      return result;
    } catch (error) {
      throw new Error(`Error getting colleges: ${error.message}`);
    }
  }

  // Get college by ID
  async getCollegeById(id) {
    const cacheKey = `${CACHE_KEYS.COLLEGE_DETAIL}${id}`;
    try {
      // Try to get from cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        throw new Error('College not found');
      }
      const result = { id: doc.id, ...doc.data() };
      
      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL.ONE_HOUR, JSON.stringify(result));
      return result;
    } catch (error) {
      throw new Error(`Error getting college: ${error.message}`);
    }
  }

  // Update college
  async updateCollege(id, updateData) {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('College not found');
      }
      
      await docRef.update(updateData);
      const updatedDoc = await docRef.get();
      const result = { id: updatedDoc.id, ...updatedDoc.data() };

      // Invalidate caches
      await redis.del(`${CACHE_KEYS.COLLEGE_DETAIL}${id}`);
      await redis.del(CACHE_KEYS.COLLEGE_LIST + '*');
      return result;
    } catch (error) {
      throw new Error(`Error updating college: ${error.message}`);
    }
  }

  // Delete college
  async deleteCollege(id) {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('College not found');
      }
      
      await docRef.delete();
      const result = { id, message: 'College deleted successfully' };

      // Invalidate caches
      await redis.del(`${CACHE_KEYS.COLLEGE_DETAIL}${id}`);
      await redis.del(CACHE_KEYS.COLLEGE_LIST + '*');
      return result;
    } catch (error) {
      throw new Error(`Error deleting college: ${error.message}`);
    }
  }

  // Search colleges by various criteria
  async searchColleges(criteria) {
    const cacheKey = `${CACHE_KEYS.COLLEGE_SEARCH}${JSON.stringify(criteria)}`;
    try {
      // Try to get from cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      let query = this.collection;
      const page = parseInt(criteria.page) || 1;
      const limit = parseInt(criteria.limit) || 10;
      const startIndex = (page - 1) * limit;

      // Handle non-text based filters first
      if (criteria.year) {
        query = query.where('year', '==', criteria.year);
      }
      if (criteria.instituteCode) {
        query = query.where('instituteCode', '==', criteria.instituteCode);
      }
      if (criteria.category) {
        query = query.where('category', '==', criteria.category);
      }
      if (criteria.branchName) {
        query = query.where('branchName', '==', criteria.branchName);
      }
      if (criteria.city) {
        query = query.where('city', '==', criteria.city);
      }

      const snapshot = await query.get();
      let results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (criteria.instituteName) {
        const searchTerms = criteria.instituteName.toLowerCase().split(/\s+/);
        
        results = results.filter(college => {
          const keywordMatch = searchTerms.some(term => 
            college.keywords?.some(keyword => 
              keyword.toLowerCase().includes(term)
            )
          );

          console.dir(college, { depth: null });
          

          const nameMatch = college.instituteName.toLowerCase()
            .includes(criteria.instituteName.toLowerCase());

          return keywordMatch || nameMatch;
        });
      }

      // Apply pagination after all filters
      const totalResults = results.length;
      const paginatedResults = results.slice(startIndex, startIndex + limit);

      const result = {
        colleges: paginatedResults,
        pagination: {
          total: totalResults,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(totalResults / limit),
          hasMore: startIndex + limit < totalResults
        }
      };

      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL.ONE_DAY, JSON.stringify(result));
      return result;
    } catch (error) {
      console.log(error);
      
      throw new Error(`Error searching colleges: ${error.message}`);
    }
  }
}

export default new CollegeService();