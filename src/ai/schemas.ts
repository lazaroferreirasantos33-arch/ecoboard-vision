import { Type } from '@google/genai';

export const PCB_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,

  properties: {
    analysis: {
      type: Type.OBJECT,
      properties: {
        confidence: {
          type: Type.NUMBER,
        },
      },
      required: ['confidence'],
    },

    identification: {
      type: Type.OBJECT,
      properties: {
        board_type: {
          type: Type.STRING,
        },
        probable_name: {
          type: Type.STRING,
        },
        manufacturer: {
          type: Type.STRING,
        },
        model: {
          type: Type.STRING,
        },
        part_number: {
          type: Type.STRING,
        },
        equipment: {
          type: Type.STRING,
        },
        application: {
          type: Type.STRING,
        },
        confidence: {
          type: Type.NUMBER,
        },
      },
      required: [
        'board_type',
        'probable_name',
        'manufacturer',
        'model',
        'part_number',
        'equipment',
        'application',
        'confidence',
      ],
    },

    engineering: {
      type: Type.OBJECT,
      properties: {
        technology: {
          type: Type.STRING,
        },
        estimated_layers: {
          type: Type.INTEGER,
        },
        density: {
          type: Type.STRING,
        },
        condition: {
          type: Type.STRING,
        },
        integrity: {
          type: Type.NUMBER,
        },
      },
      required: [
        'technology',
        'estimated_layers',
        'density',
        'condition',
        'integrity',
      ],
    },

    components: {
      type: Type.OBJECT,
      properties: {
        cpu: { type: Type.INTEGER },
        fpga: { type: Type.INTEGER },
        asic: { type: Type.INTEGER },
        bga: { type: Type.INTEGER },
        memory: { type: Type.INTEGER },
        gold_fingers: { type: Type.INTEGER },
        tantalum: { type: Type.INTEGER },
        transformers: { type: Type.INTEGER },
        connectors: { type: Type.INTEGER },
        relays: { type: Type.INTEGER },
        oscillators: { type: Type.INTEGER },
      },
      required: [
        'cpu',
        'fpga',
        'asic',
        'bga',
        'memory',
        'gold_fingers',
        'tantalum',
        'transformers',
        'connectors',
        'relays',
        'oscillators',
      ],
    },

    recycling: {
      type: Type.OBJECT,
      properties: {
        commercial_grade: {
          type: Type.STRING,
        },
        eco_score: {
          type: Type.INTEGER,
        },
        gold: {
          type: Type.STRING,
        },
        silver: {
          type: Type.STRING,
        },
        palladium: {
          type: Type.STRING,
        },
        copper: {
          type: Type.STRING,
        },
      },
      required: [
        'commercial_grade',
        'eco_score',
        'gold',
        'silver',
        'palladium',
        'copper',
      ],
    },

    recommendation: {
      type: Type.OBJECT,
      properties: {
        decision: {
          type: Type.STRING,
        },
        reason: {
          type: Type.STRING,
        },
      },
      required: [
        'decision',
        'reason',
      ],
    },
  },

  required: [
    'analysis',
    'identification',
    'engineering',
    'components',
    'recycling',
    'recommendation',
  ],
};