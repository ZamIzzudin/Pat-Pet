// lib/metaDataHelper.ts - Fixed version without circular imports

import { PinataSDK } from "pinata";

const pinataGateway = process.env.NEXT_PUBLIC_PAT_PET_PINATA_GATEWAY;

// Use string literals instead of enums to avoid circular imports
type PetTypeString = 'DRAGON' | 'CAT' | 'PLANT';
type EvolutionStageString = 'EGG' | 'BABY' | 'ADULT';

// Initialize Pinata SDK
const initializePinata = () => {
  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!pinataJwt) {
    throw new Error('PINATA_JWT environment variable is required');
  }

  if (!pinataGateway) {
    throw new Error('PINATA_GATEWAY environment variable is required');
  }

  return new PinataSDK({
    pinataJwt,
    pinataGateway,
  });
};

// Static IPFS URLs for pet images and assets
export const PET_ASSETS = {
  DRAGON: {
    images: {
      EGG: `${pinataGateway}/ipfs/bafkreihswqedv24xdnjtll2oiguar35dn4heyxqj7dwta64fx6i5xhn5ny`,
      BABY: `${pinataGateway}/ipfs/bafkreigcm2tnrzmihsbfsn44lavrwvg3fprt3zwlfwwc74hqakha6lb44i`,
      ADULT: `${pinataGateway}/ipfs/bafkreigcm2tnrzmihsbfsn44lavrwvg3fprt3zwlfwwc74hqakha6lb44i`,
    },
    sprite: `${pinataGateway}/ipfs/bafkreicbmbbxnpyanm54ozwk27wtut6zvvo77g72zxb4jd6sfz7lx4p34i`, 
    metadata: {
      name: "Dragon",
      description: "A fierce dragon companion that breathes fire and soars through the skies",
      rarity: "Epic",
      element: "Fire"
    }
  },
  CAT: {
    images: {
      EGG: `${pinataGateway}/ipfs/bafkreif4umwprhu3jkkhqcrzccr42hyfuz6bis7ztgcszctufdclsyi73a`,
      BABY: `${pinataGateway}/ipfs/bafkreig5hqcubiy33f2whq54ebhdegps3jmxs7amsk6wjfba2hywpc7rgm`,
      ADULT: `${pinataGateway}/ipfs/bafkreig5hqcubiy33f2whq54ebhdegps3jmxs7amsk6wjfba2hywpc7rgm`,
    },
    sprite: `${pinataGateway}/ipfs/bafkreiaulxgnc5hstx47m66kc5bmbvllewplegjseggrqwsu5ibo2j42xm`,
    metadata: {
      name: "Cat",
      description: "A curious and agile feline companion with sharp instincts",
      rarity: "Common",
      element: "Earth"
    }
  },
  PLANT: {
    images: {
      EGG: `${pinataGateway}/ipfs/bafkreidhrd6libud5rzgodb4f2nrbeqwlit6xflh63nqvqsfqyobwhxtsu`,
      BABY: `${pinataGateway}/ipfs/bafkreifhpq6dlahgs7fg5cd6yfcddvxzguzk6riws42g6ucu2g677n5nbu`, 
      ADULT: `${pinataGateway}/ipfs/bafkreifhpq6dlahgs7fg5cd6yfcddvxzguzk6riws42g6ucu2g677n5nbu`
    },
    sprite: `${pinataGateway}/ipfs/bafkreifwsecavxtb3ovzr43bc2bskaiii43ixh6hxwrd2vpnglnpdrjed4`, 
    metadata: {
      name: "Plant",
      description: "A mystical plant companion that harnesses nature's power",
      rarity: "Rare",
      element: "Nature"
    }
  }
} as const

// Evolution stage descriptions
export const EVOLUTION_DESCRIPTIONS = {
  EGG: {
    name: "Egg",
    description: "A mysterious egg filled with potential, waiting to hatch"
  },
  BABY: {
    name: "Baby", 
    description: "A young companion learning and growing with each milestone"
  },
  ADULT: {
    name: "Adult",
    description: "A fully evolved companion with mastered abilities"
  }
} as const

// Conversion helpers for enum compatibility
export const convertPetTypeToString = (petType: any): PetTypeString => {
  if (typeof petType === 'string') return petType as PetTypeString;
  
  // Handle enum values
  switch (petType) {
    case 0: return 'DRAGON';
    case 1: return 'CAT';
    case 2: return 'PLANT';
    default: return 'CAT';
  }
};

export const convertEvolutionStageToString = (stage: any): EvolutionStageString => {
  if (typeof stage === 'string') return stage as EvolutionStageString;
  
  // Handle enum values
  switch (stage) {
    case 0: return 'EGG';
    case 1: return 'BABY';
    case 2: return 'ADULT';
    default: return 'EGG';
  }
};

export interface PetMetadataParams {
  petName: string
  petType: any // Accept any type to avoid circular imports
  stage: any // Accept any type to avoid circular imports
  goalId: number
  tokenId?: number
  milestonesCompleted: number
  totalMilestones: number
  level: number
  experience: number
  birthTime?: number
  goalTitle?: string
  isHappy?: boolean
}

export interface GeneratedPetMetadata {
  name: string
  description: string
  image: string
  external_url: string
  animation_url?: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  properties: {
    pet_type: string
    evolution_stage: string
    sprite_url: string
    created_at: number
    version: string
    milestone_based_evolution: boolean
  }
}

export class PetMetadataHelper {
  private static readonly BASE_URL = "https://patpet.xyz"
  private static readonly VERSION = "1.0.0"

  /**
   * Generate complete pet metadata for NFT
   */
  static generatePetMetadata(params: PetMetadataParams): GeneratedPetMetadata {
    const petTypeKey = convertPetTypeToString(params.petType);
    const stageKey = convertEvolutionStageToString(params.stage);
    const petAssets = PET_ASSETS[petTypeKey];
    const stageInfo = EVOLUTION_DESCRIPTIONS[stageKey];

    // Get appropriate image for current stage
    const nftImage = petAssets.images[stageKey];
    
    // Calculate progress and rarity
    const progressPercentage = params.totalMilestones > 0 
      ? Math.round((params.milestonesCompleted / params.totalMilestones) * 100)
      : 0;
    
    const rarity = this.calculateRarity(stageKey, params.milestonesCompleted, params.totalMilestones);
    const mood = params.isHappy !== undefined ? (params.isHappy ? "Happy" : "Sad") : "Neutral";

    return {
      name: params.petName,
      description: `${params.petName} is a ${petAssets.metadata.name} companion in the ${stageInfo.name} stage. ${stageInfo.description}. This Pet Pat grows stronger with each milestone achievement and evolves based on progress towards goals.`,
      image: nftImage,
      external_url: params.tokenId 
        ? `${this.BASE_URL}/pet/${params.tokenId}`
        : `${this.BASE_URL}/goal/${params.goalId}`,
      animation_url: petAssets.sprite,
      attributes: [
        {
          trait_type: "Pet Type",
          value: petAssets.metadata.name
        },
        {
          trait_type: "Evolution Stage", 
          value: stageInfo.name
        },
        {
          trait_type: "Level",
          value: params.level
        },
        {
          trait_type: "Experience",
          value: params.experience
        },
        {
          trait_type: "Milestones Completed",
          value: params.milestonesCompleted
        },
        {
          trait_type: "Total Milestones",
          value: params.totalMilestones
        },
        {
          trait_type: "Progress",
          value: `${progressPercentage}%`
        },
        {
          trait_type: "Goal ID",
          value: params.goalId
        },
        {
          trait_type: "Rarity",
          value: rarity
        },
        {
          trait_type: "Element",
          value: petAssets.metadata.element
        },
        {
          trait_type: "Mood",
          value: mood
        },
        {
          trait_type: "Birth Time",
          value: params.birthTime || Date.now()
        }
      ],
      properties: {
        pet_type: petTypeKey,
        evolution_stage: stageKey,
        sprite_url: petAssets.sprite,
        created_at: Date.now(),
        version: this.VERSION,
        milestone_based_evolution: true
      }
    }
  }

  /**
   * Generate metadata for goal creation (EGG stage)
   */
  static generateInitialPetMetadata(
    petName: string,
    petType: any,
    goalId: number,
    totalMilestones: number,
    goalTitle?: string
  ): GeneratedPetMetadata {
    return this.generatePetMetadata({
      petName,
      petType,
      stage: 'EGG', // Use string directly
      goalId,
      milestonesCompleted: 0,
      totalMilestones,
      level: 1,
      experience: 0,
      birthTime: Date.now(),
      goalTitle,
      isHappy: true
    })
  }

  /**
   * Generate updated metadata for milestone completion
   */
  static generateUpdatedPetMetadata(
    currentMetadata: GeneratedPetMetadata,
    newStage: any,
    milestonesCompleted: number,
    level: number,
    experience: number,
    isHappy: boolean = true
  ): GeneratedPetMetadata {
    // Extract info from existing metadata
    const petTypeKey = currentMetadata.properties.pet_type as PetTypeString;
    const existingGoalId = currentMetadata.attributes.find(attr => attr.trait_type === "Goal ID")?.value as number;
    const existingTotalMilestones = currentMetadata.attributes.find(attr => attr.trait_type === "Total Milestones")?.value as number;
    const existingPetName = currentMetadata.name;
    const existingBirthTime = currentMetadata.attributes.find(attr => attr.trait_type === "Birth Time")?.value as number;

    return this.generatePetMetadata({
      petName: existingPetName,
      petType: petTypeKey,
      stage: newStage,
      goalId: existingGoalId,
      milestonesCompleted,
      totalMilestones: existingTotalMilestones,
      level,
      experience,
      birthTime: existingBirthTime,
      isHappy
    })
  }

  /**
   * Upload metadata to Pinata using SDK
   */
  static async uploadMetadataToPinata(
    metadata: GeneratedPetMetadata,
    tokenId?: number
  ): Promise<string> {
    try {
      console.log('🚀 Initializing Pinata SDK...');
      
      const pinata = initializePinata();
      
      console.log('📝 Preparing metadata for upload...');
      
      const fileName = `${metadata.name}-metadata-${Date.now()}.json`;
      
      console.log('📤 Uploading metadata to Pinata...');
      
      const upload = await pinata.upload.public
        .json(metadata)
        .name(fileName)
        .keyvalues({
          type: 'pet_metadata',
          pet_name: metadata.name,
          pet_type: metadata.properties.pet_type,
          evolution_stage: metadata.properties.evolution_stage,
          token_id: tokenId?.toString() || 'new',
          timestamp: Date.now().toString(),
          version: metadata.properties.version
        });

      console.log('✅ Pinata upload successful:', upload);
      
      const ipfsHash = upload.cid;
      
      if (!ipfsHash) {
        throw new Error('No CID returned from Pinata SDK');
      }

      console.log('✅ Metadata uploaded to Pinata:', ipfsHash);
      
      return ipfsHash;

    } catch (error) {
      console.error('❌ Failed to upload metadata to Pinata:', error);
      throw error;
    }
  }

  /**
   * Get pet image URL for display - Works with enums or strings
   */
  static getPetImageUrl(petType: any, stage: any): string {
    const petTypeKey = convertPetTypeToString(petType);
    const stageKey = convertEvolutionStageToString(stage);
    
    return PET_ASSETS[petTypeKey].images[stageKey];
  }

  /**
   * Get pet sprite URL for animations - Works with enums or strings
   */
  static getPetSpriteUrl(petType: any): string {
    const petTypeKey = convertPetTypeToString(petType);
    return PET_ASSETS[petTypeKey].sprite;
  }

  /**
   * Get pet type metadata
   */
  static getPetTypeMetadata(petType: any) {
    const petTypeKey = convertPetTypeToString(petType);
    return PET_ASSETS[petTypeKey].metadata;
  }

  /**
   * Calculate rarity based on evolution stage and progress
   */
  private static calculateRarity(
    stage: EvolutionStageString, 
    milestonesCompleted: number, 
    totalMilestones: number
  ): string {
    if (stage === 'ADULT') {
      return "Legendary";
    } else if (stage === 'BABY') {
      return "Rare";
    } else {
      const progress = totalMilestones > 0 ? milestonesCompleted / totalMilestones : 0;
      if (progress >= 0.25) return "Uncommon";
      return "Common";
    }
  }

  /**
   * Parse metadata from IPFS hash using Pinata Gateway
   */
  static async fetchMetadataFromIPFS(ipfsHash: string) {
    try {
      try {
        const pinata = initializePinata();
        const data = await pinata.gateways.public.get(ipfsHash);
        return data ;
      } catch (sdkError) {
        console.warn('⚠️ Pinata SDK fetch failed, falling back to direct gateway');
      }

      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch metadata from IPFS:', error)
      throw error
    }
  }

  /**
   * Validate metadata structure
   */
  static validateMetadata(metadata: any): metadata is GeneratedPetMetadata {
    return (
      typeof metadata === 'object' &&
      typeof metadata.name === 'string' &&
      typeof metadata.description === 'string' &&
      typeof metadata.image === 'string' &&
      Array.isArray(metadata.attributes) &&
      typeof metadata.properties === 'object' &&
      typeof metadata.properties.pet_type === 'string' &&
      typeof metadata.properties.evolution_stage === 'string'
    )
  }
}

// Export helper functions for easy use
export const {
  generatePetMetadata,
  generateInitialPetMetadata,
  generateUpdatedPetMetadata,
  uploadMetadataToPinata,
  getPetImageUrl,
  getPetSpriteUrl,
  getPetTypeMetadata,
  fetchMetadataFromIPFS,
  validateMetadata,
} = PetMetadataHelper