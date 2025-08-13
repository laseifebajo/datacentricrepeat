const { MongoClient } = require('mongodb');

// MongoDB SETUP
const url = 'mongodb://localhost:27017';
const dbName = 'proj2024MongoDB';
const collectionName = 'lecturers';

class MongoDao {
    
    // This creates a connection to Mongos database
    async getConnection() {
        
        const client = new MongoClient(url);
        await client.connect();
        return client;
    }

    // Get all lecturers in numerical order by id
    async getAllLecturers() {

        const client = await this.getConnection();
        try {
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            
            // This gets all lectureers and sorts them by id in ascending order
            const lecturers = await collection
                .find({})
                .sort({ _id: 1 })
                .toArray();
                
            return lecturers;
        } finally {
            await client.close();
        }
    }

    // Delete lecturer by their Id
    async deleteLecturer(lecturerId) {
        
        const client = await this.getConnection();
        try {
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            
            const result = await collection.deleteOne({ _id: lecturerId });
            return result.deletedCount > 0;
        } finally {
            await client.close();
        }
    }
}

module.exports = new MongoDao();