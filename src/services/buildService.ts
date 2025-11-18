import { TrackedBuild } from '../models/index.js';
import { getCharacter, Character } from '../data/characters.js';
import { calculateAscensionMaterials, calculateTalentMaterials } from '../data/materials.js';
import logger from '../utils/logger.js';

interface TrackCharacterOptions {
  currentLevel?: number;
  targetLevel?: number;
  currentAscension?: number;
  normalAttackLevel?: number;
  elementalSkillLevel?: number;
  elementalBurstLevel?: number;
  targetNormalAttack?: number;
  targetElementalSkill?: number;
  targetElementalBurst?: number;
  priority?: number;
}

interface BuildUpdates {
  currentLevel?: number;
  targetLevel?: number;
  currentAscension?: number;
  normalAttackLevel?: number;
  elementalSkillLevel?: number;
  elementalBurstLevel?: number;
  targetNormalAttack?: number;
  targetElementalSkill?: number;
  targetElementalBurst?: number;
  priority?: number;
  notes?: string | null;
  materialsCollected?: Record<string, any>;
}

interface TalentMaterials {
  mora: number;
  books: {
    teaching: number;
    guide: number;
    philosophies: number;
  };
  commonMaterial: {
    gray: number;
    green: number;
    blue: number;
  };
  weeklyBoss: number;
  crown: number;
}

interface MaterialsCalculation {
  character: Character;
  ascension: any;
  talents: TalentMaterials;
  total: {
    mora: number;
  };
}

export class BuildService {
  async trackCharacter(userId: string, characterName: string, options: TrackCharacterOptions = {}): Promise<TrackedBuild> {
    try {
      const character = getCharacter(characterName);
      if (!character) {
        throw new Error('Character not found');
      }

      const build = await TrackedBuild.create({
        userId,
        characterName: character.name,
        currentLevel: options.currentLevel || 1,
        targetLevel: options.targetLevel || 90,
        currentAscension: options.currentAscension || 0,
        normalAttackLevel: options.normalAttackLevel || 1,
        elementalSkillLevel: options.elementalSkillLevel || 1,
        elementalBurstLevel: options.elementalBurstLevel || 1,
        targetNormalAttack: options.targetNormalAttack || 10,
        targetElementalSkill: options.targetElementalSkill || 10,
        targetElementalBurst: options.targetElementalBurst || 10,
        priority: options.priority || 0,
      });

      logger.info(`User ${userId} started tracking ${character.name}`);
      return build;
    } catch (error) {
      logger.error(`Error tracking character for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserBuilds(userId: string): Promise<TrackedBuild[]> {
    try {
      return await TrackedBuild.findAll({
        where: { userId },
        order: [['priority', 'DESC'], ['createdAt', 'ASC']],
      });
    } catch (error) {
      logger.error(`Error getting builds for user ${userId}:`, error);
      throw error;
    }
  }

  async getBuild(buildId: number): Promise<TrackedBuild | null> {
    try {
      return await TrackedBuild.findByPk(buildId);
    } catch (error) {
      logger.error(`Error getting build ${buildId}:`, error);
      throw error;
    }
  }

  async updateBuild(buildId: number, updates: BuildUpdates): Promise<TrackedBuild> {
    try {
      const build = await TrackedBuild.findByPk(buildId);
      if (!build) {
        throw new Error('Build not found');
      }

      await build.update(updates);
      logger.info(`Updated build ${buildId}`);
      return build;
    } catch (error) {
      logger.error(`Error updating build ${buildId}:`, error);
      throw error;
    }
  }

  async deleteBuild(buildId: number): Promise<boolean> {
    try {
      const build = await TrackedBuild.findByPk(buildId);
      if (!build) {
        throw new Error('Build not found');
      }

      await build.destroy();
      logger.info(`Deleted build ${buildId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting build ${buildId}:`, error);
      throw error;
    }
  }

  async calculateRequiredMaterials(buildId: number): Promise<MaterialsCalculation> {
    try {
      const build = await TrackedBuild.findByPk(buildId);
      if (!build) {
        throw new Error('Build not found');
      }

      const character = getCharacter(build.characterName);
      if (!character) {
        throw new Error('Character data not found');
      }

      const ascensionMats = calculateAscensionMaterials(
        build.currentLevel,
        build.targetLevel,
        character.rarity
      );

      const normalAttackMats = calculateTalentMaterials(
        build.normalAttackLevel,
        build.targetNormalAttack
      );

      const skillMats = calculateTalentMaterials(
        build.elementalSkillLevel,
        build.targetElementalSkill
      );

      const burstMats = calculateTalentMaterials(
        build.elementalBurstLevel,
        build.targetElementalBurst
      );

      // Combine talent materials
      const totalTalentMats: TalentMaterials = {
        mora: normalAttackMats.mora + skillMats.mora + burstMats.mora,
        books: {
          teaching: normalAttackMats.books.teaching + skillMats.books.teaching + burstMats.books.teaching,
          guide: normalAttackMats.books.guide + skillMats.books.guide + burstMats.books.guide,
          philosophies: normalAttackMats.books.philosophies + skillMats.books.philosophies + burstMats.books.philosophies,
        },
        commonMaterial: {
          gray: normalAttackMats.commonMaterial.gray + skillMats.commonMaterial.gray + burstMats.commonMaterial.gray,
          green: normalAttackMats.commonMaterial.green + skillMats.commonMaterial.green + burstMats.commonMaterial.green,
          blue: normalAttackMats.commonMaterial.blue + skillMats.commonMaterial.blue + burstMats.commonMaterial.blue,
        },
        weeklyBoss: normalAttackMats.weeklyBoss + skillMats.weeklyBoss + burstMats.weeklyBoss,
        crown: normalAttackMats.crown + skillMats.crown + burstMats.crown,
      };

      return {
        character,
        ascension: ascensionMats,
        talents: totalTalentMats,
        total: {
          mora: ascensionMats.mora + totalTalentMats.mora,
        },
      };
    } catch (error) {
      logger.error(`Error calculating materials for build ${buildId}:`, error);
      throw error;
    }
  }

  async updateMaterialProgress(buildId: number, materialType: string, amount: number): Promise<TrackedBuild> {
    try {
      const build = await TrackedBuild.findByPk(buildId);
      if (!build) {
        throw new Error('Build not found');
      }

      const collected = build.materialsCollected || {};
      collected[materialType] = (collected[materialType] || 0) + amount;

      await build.update({ materialsCollected: collected });
      return build;
    } catch (error) {
      logger.error(`Error updating material progress for build ${buildId}:`, error);
      throw error;
    }
  }
}

export default new BuildService();
