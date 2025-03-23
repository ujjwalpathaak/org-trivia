import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

const badgeSchema = new mongoose.Schema({
  rank: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
});

const Badge = mongoose.model('Badge', badgeSchema);

const findBadgeByRank = async (rank) => {
  return Badge.findOne({ rank });
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await Badge.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Badge Repository', () => {
  it('should find a badge by rank', async () => {
    const sampleBadge = await Badge.create({ rank: 1, name: 'Gold' });

    const foundBadge = await findBadgeByRank(1);

    expect(foundBadge).toBeDefined();
    expect(foundBadge.rank).toBe(1);
    expect(foundBadge.name).toBe('Gold');
  });

  it('should return null if no badge is found', async () => {
    const foundBadge = await findBadgeByRank(99);
    expect(foundBadge).toBeNull();
  });
});
