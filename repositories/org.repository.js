import Org from '../models/org.model.js';

import { ObjectId } from 'mongodb';

import LeaderboardRepository from './leaderboard.respository.js';
import ResultRepository from './result.repository.js';
import Question from '../models/question.model.js';

const resultRepository = new ResultRepository();
const leaderboardRepository = new LeaderboardRepository();

class OrgRepository {
  constructor() {
    this.categoryMap = {
      PnA: 'questionsPnA',
      CAnIT: 'questionsCAnIT',
      HRD: 'questionsHRD',
    };
  }

  async updateQuestionsStatusInOrgToUsed(orgId, category, questionIds, idsOfQuestionsToDelete) {
    const questionField = this.categoryMap[category];
    if (!questionField) throw new Error('Invalid category');

    await Question.deleteMany({ _id: { $in: idsOfQuestionsToDelete } });
    await Org.updateMany(
      { _id: new ObjectId(orgId) },
      { $pull: { [questionField]: { questionId: { $in: idsOfQuestionsToDelete } } } }
    );
    
    return Org.updateMany(
      { _id: new ObjectId(orgId) },
      { $set: { [`${questionField}.$[elem].isUsed`]: true } },
      { arrayFilters: [{ 'elem.questionId': { $in: questionIds } }] },
    );
  }

  async addQuestionToOrg(question, orgId) {
    const questionField = this.categoryMap[question.category];
    if (!questionField) throw new Error('Invalid question category');

    const result = await Org.updateOne(
      { _id: new ObjectId(orgId) },
      {
        $push: {
          [questionField]: {
            questionId: question._id,
            isUsed: false,
            category: question.category,
            source: question.source,
          },
        },
      },
    );

    if (!result.matchedCount) throw new Error('Organization not found');
    return true;
  }

  async getTriviaEnabledOrgs() {
    return Org.find({ 'settings.isTriviaEnabled': true });
  }

  async setNextQuestionGenre(orgId, currentGenreIndex) {
    const org = await Org.findById(orgId).select('settings.selectedGenre');
    if (!org) throw new Error('Organization not found');

    const totalGenres = org.settings.selectedGenre.length;
    if (!totalGenres) throw new Error('No genres available');

    const nextIndex = (currentGenreIndex + 1) % totalGenres;
    await Org.updateOne(
      { _id: orgId },
      { $set: { 'settings.currentGenre': nextIndex } },
    );

    return true;
  }

  async updateNewUserInOrg(orgId, isAdmin, newUser) {
    return Org.updateOne(
      { _id: new ObjectId(orgId) },
      { $push: { [isAdmin ? 'admins' : 'employees']: newUser._id } },
    );
  }

  async changeGenreSettings(genre, orgId) {
    return Org.updateOne(
      { _id: orgId },
      { $set: { 'settings.selectedGenre': genre, 'settings.currentGenre': 0 } },
    );
  }

  async getSettings(orgId) {
    return Org.findById(orgId).select('settings');
  }

  async getAllOrgNames() {
    return Org.find({}, 'id name');
  }

  async getAllOrgIds() {
    return Org.find({}, 'id');
  }

  async getOrgById(orgId) {
    return Org.findById(orgId);
  }

  async isTriviaEnabled(orgId) {
    return Org.findById(orgId).select('settings.isTriviaEnabled');
  }

  async updateTriviaSettings(orgId, newStatus) {
    return Org.updateOne(
      { _id: orgId },
      { $set: { 'settings.isTriviaEnabled': newStatus } },
    );
  }

  async fetchHRDQuestions(orgId) {
    const files = await Org.aggregate([
      { $match: { _id: new ObjectId(orgId) } },
      { $unwind: '$questionsHRD' },
      { $match: { 'questionsHRD.isUsed': false } },
      {
        $group: {
          _id: '$questionsHRD.file',
          questions: { $push: '$questionsHRD' },
        },
      },
    ]);

    if (files.length === 0) return [];

    const questionsPerFile = Math.max(1, Math.floor(15 / files.length));

    return Org.aggregate([
      { $match: { _id: new ObjectId(orgId) } },
      { $unwind: '$questionsHRD' },
      { $match: { 'questionsHRD.isUsed': false, 'questionsHRD.source': 'AI' } },
      {
        $group: {
          _id: '$questionsHRD.file',
          questions: { $push: '$questionsHRD' },
        },
      },
      {
        $project: {
          _id: 1,
          questions: { $slice: ['$questions', questionsPerFile] },
        },
      },
      { $unwind: '$questions' },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions.questionId',
          foreignField: '_id',
          as: 'questionDetails',
        },
      },
      { $unwind: '$questionDetails' },
      { $replaceRoot: { newRoot: '$questionDetails' } },
    ]);
  }

  async fetchExtraEmployeeQuestions(orgId, quizId, genre) {
    const genreField = this.categoryMap[genre];

    return Org.aggregate([
      { $match: { _id: new ObjectId(orgId) } },
      { $unwind: `$${genreField}` },
      {
        $match: {
          [`${genreField}.isUsed`]: false,
          [`${genreField}.source`]: 'Employee',
        },
      },
      {
        $lookup: {
          from: 'questions',
          localField: `${genreField}.questionId`,
          foreignField: '_id',
          as: 'questionDetails',
        },
      },
      { $unwind: '$questionDetails' },
      { $replaceRoot: { newRoot: '$questionDetails' } },
    ]);
  }

  async pushQuestionsInOrg(questions, genre, orgId) {
    return Org.updateMany(
      { _id: new ObjectId(orgId) },
      { $push: { [`questions${genre}`]: { $each: questions } } },
    );
  }

  async getAnalytics(orgId) {
    const [participationByGenre, last3Leaderboards] = await Promise.all([
      resultRepository.getParticipationByGenre(orgId),
      leaderboardRepository.getLast3Leaderboards(orgId),
    ]);

    return { participationByGenre, last3Leaderboards };
  }
}

export default OrgRepository;
