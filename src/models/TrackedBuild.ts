import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection.js';

// TrackedBuild attributes interface
export interface TrackedBuildAttributes {
  id: number;
  userId: string;
  characterName: string;
  currentLevel: number;
  targetLevel: number;
  currentAscension: number;
  normalAttackLevel: number;
  elementalSkillLevel: number;
  elementalBurstLevel: number;
  targetNormalAttack: number;
  targetElementalSkill: number;
  targetElementalBurst: number;
  materialsCollected: Record<string, any>;
  notes: string | null;
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
export interface TrackedBuildCreationAttributes extends Optional<TrackedBuildAttributes,
  'id' |
  'currentLevel' |
  'targetLevel' |
  'currentAscension' |
  'normalAttackLevel' |
  'elementalSkillLevel' |
  'elementalBurstLevel' |
  'targetNormalAttack' |
  'targetElementalSkill' |
  'targetElementalBurst' |
  'materialsCollected' |
  'notes' |
  'priority'
> {}

class TrackedBuild extends Model<TrackedBuildAttributes, TrackedBuildCreationAttributes> implements TrackedBuildAttributes {
  declare id: number;
  declare userId: string;
  declare characterName: string;
  declare currentLevel: number;
  declare targetLevel: number;
  declare currentAscension: number;
  declare normalAttackLevel: number;
  declare elementalSkillLevel: number;
  declare elementalBurstLevel: number;
  declare targetNormalAttack: number;
  declare targetElementalSkill: number;
  declare targetElementalBurst: number;
  declare materialsCollected: Record<string, any>;
  declare notes: string | null;
  declare priority: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TrackedBuild.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  characterName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currentLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 90,
    },
  },
  targetLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 90,
    validate: {
      min: 1,
      max: 90,
    },
  },
  currentAscension: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 6,
    },
  },
  normalAttackLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10,
    },
  },
  elementalSkillLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10,
    },
  },
  elementalBurstLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10,
    },
  },
  targetNormalAttack: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  targetElementalSkill: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  targetElementalBurst: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  materialsCollected: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'JSON object tracking collected materials',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Higher number = higher priority',
  },
}, {
  sequelize,
  tableName: 'tracked_builds',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['characterName'],
    },
    {
      fields: ['priority'],
    },
  ],
});

export default TrackedBuild;
