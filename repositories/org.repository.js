import Org from '../models/org.model.js';

import { ObjectId } from 'mongodb';

import LeaderboardRepository from './leaderboard.respository.js';
import ResultRepository from './result.repository.js';

const resultRepository = new ResultRepository();
const leaderboardRepository = new LeaderboardRepository();

class OrgRepository {
  async updateQuestionsStatusInOrgToUsed(
    orgId,
    category,
    idsOfQuestionsToApprove,
  ) {
    const categoryMap = {
      PnA: 'questionsPnA',
      CAnIT: 'questionsCAnIT',
      HRD: 'questionsHRD',
    };

    const questionField = categoryMap[category];
    if (!questionField) {
      throw new Error('Invalid category');
    }

    return await Org.updateMany(
      { _id: new ObjectId(orgId) },
      {
        $set: { [`${questionField}.$[elem].isUsed`]: true },
      },
      {
        arrayFilters: [
          {
            'elem.questionId': {
              $in: idsOfQuestionsToApprove,
            },
          },
        ],
      },
    );
  }

  async addQuestionToOrg(question, orgId) {
    const questionId = question._id;
    const questionCategory = question.category;
    let query = '';

    switch (questionCategory) {
      case 'PnA':
        query = 'questionsPnA';
        break;
      case 'HRD':
        query = 'questionsHRD';
        break;
      case 'CAnIT':
        query = 'questionsCAnIT';
        break;
      default:
        throw new Error('Invalid question category');
    }

    const result = await Org.updateOne(
      { _id: new ObjectId(orgId) },
      {
        $push: {
          [query]: {
            questionId,
            isUsed: false,
            category: questionCategory,
            source: question.source,
          },
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error('Organization not found');
    }

    return true;
  }

  async getTriviaEnabledOrgs() {
    return Org.find({
      'settings.isTriviaEnabled': true,
    });
  }

  async setNextQuestionGenre(orgId, currentGenreIndex) {
    const org = await Org.findById(orgId).select('settings.selectedGenre');
    if (!org) throw new Error('Organization not found');

    const totalGenres = org.settings.selectedGenre.length;
    if (totalGenres === 0) throw new Error('No genres available');

    const nextIndex = (currentGenreIndex + 1) % totalGenres;
    await Org.updateOne(
      { _id: orgId },
      { $set: { 'settings.currentGenre': nextIndex } },
    );

    return true;
  }

  async updateNewUserInOrg(orgId, isAdmin, newUser) {
    const fieldName = isAdmin ? 'admins' : 'employees';
    return Org.updateOne(
      { _id: new ObjectId(orgId) },
      { $push: { [fieldName]: newUser._id } },
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
    return Org.find({}).select('id name');
  }

  async getAllOrgIds() {
    return Org.find({}).select('id');
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
    return Org.aggregate([
      {
        $match: { _id: new ObjectId(orgId) },
      },
      {
        $unwind: '$questionsHRD',
      },
      {
        $match: { 'questionsHRD.isUsed': false },
      },
      {
        $group: {
          _id: '$questionsHRD.file',
          questions: { $push: '$questionsHRD' },
        },
      },
      {
        $project: {
          _id: 1,
          questions: { $slice: ['$questions', 2] },
        },
      },
      {
        $unwind: '$questions',
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions.questionId',
          foreignField: '_id',
          as: 'questionDetails',
        },
      },
      {
        $unwind: '$questionDetails',
      },
      {
        $replaceRoot: { newRoot: '$questionDetails' },
      },
    ]);
  }

  async fetchExtraEmployeeQuestions(orgId, quizId, genre) {
    return Org.aggregate([
      {
        $match: { _id: new ObjectId(orgId) },
      },
      {
        $unwind: '$questionsPnA',
      },
      {
        $match: {
          'questionsPnA.isUsed': false,
          'questionsPnA.source': 'Employee',
        },
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'questionsPnA.questionId',
          foreignField: '_id',
          as: 'questionDetails',
        },
      },
      {
        $unwind: '$questionDetails',
      },
      {
        $replaceRoot: {
          newRoot: '$questionDetails',
        },
      },
    ]);
  }

  async pushQuestionsInOrg(finalFormatedRefactoredQuestions, genre, orgId) {
    const fieldName = `questions${genre}`;

    return Org.updateMany(
      { _id: new ObjectId(orgId) },
      {
        $push: {
          [fieldName]: {
            $each: finalFormatedRefactoredQuestions,
          },
        },
      },
    );
  }

  async getAnalytics(orgId) {
    const participationByGenre = resultRepository.getParticipationByGenre(orgId);

    const last3Leaderboards =
      await leaderboardRepository.getLast3Leaderboards(orgId);

    return {
      participationByGenre,
      last3Leaderboards,
    };
  }
}

export default OrgRepository;
