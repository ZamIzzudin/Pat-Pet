// lib/metadata-helper.ts - Updated with Pinata SDK

import { PinataSDK } from "pinata";
import { EvolutionStage, PetType } from "@/app/hooks/contexts/GoalHookContext"

const pinataGateway = process.env.NEXT_PUBLIC_PAT_PET_PINATA_GATEWAY;

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
    // NFT Images for each evolution stage
    images: {
      EGG: "ipfs/QmDragonEggStatic001",
      BABY: "https://gateway.pinata.cloud/ipfs/QmDragonBabyStatic002", 
      ADULT: "https://gateway.pinata.cloud/ipfs/QmDragonAdultStatic003"
    },
    // Single sprite sheet for animations/game
    sprite: "https://gateway.pinata.cloud/ipfs/QmDragonSpriteSheet001",
    metadata: {
      name: "Dragon",
      description: "A fierce dragon companion that breathes fire and soars through the skies",
      rarity: "Epic",
      element: "Fire"
    }
  },
  CAT: {
    images: {
      EGG: `${pinataGateway}/ipfs/bafkreidhrd6libud5rzgodb4f2nrbeqwlit6xflh63nqvqsfqyobwhxtsu`,
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
      EGG: "https://gateway.pinata.cloud/ipfs/QmPlantSeedStatic001",
      BABY: "https://gateway.pinata.cloud/ipfs/QmPlantSproutStatic002",
      ADULT: "https://gateway.pinata.cloud/ipfs/QmPlantBloomStatic003"
    },
    sprite: "https://gateway.pinata.cloud/ipfs/QmPlantSpriteSheet001",
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

// Pet type mapping
export const PET_TYPE_NAMES: Record<PetType, keyof typeof PET_ASSETS> = {
  [PetType.DRAGON]: 'DRAGON',
  [PetType.CAT]: 'CAT',
  [PetType.PLANT]: 'PLANT'
}

// Evolution stage mapping
export const EVOLUTION_STAGE_NAMES: Record<EvolutionStage, keyof typeof EVOLUTION_DESCRIPTIONS> = {
  [EvolutionStage.EGG]: 'EGG',
  [EvolutionStage.BABY]: 'BABY', 
  [EvolutionStage.ADULT]: 'ADULT'
}

export interface PetMetadataParams {
  petName: string
  petType: PetType
  stage: EvolutionStage
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
    const petTypeKey = PET_TYPE_NAMES[params.petType]
    const stageKey = EVOLUTION_STAGE_NAMES[params.stage]
    const petAssets = PET_ASSETS[petTypeKey]
    const stageInfo = EVOLUTION_DESCRIPTIONS[stageKey]

    // Get appropriate image for current stage
    const nftImage = petAssets.images[stageKey]
    
    // Calculate progress and rarity
    const progressPercentage = params.totalMilestones > 0 
      ? Math.round((params.milestonesCompleted / params.totalMilestones) * 100)
      : 0
    
    const rarity = this.calculateRarity(params.stage, params.milestonesCompleted, params.totalMilestones)
    const mood = params.isHappy !== undefined ? (params.isHappy ? "Happy" : "Sad") : "Neutral"

    return {
      name: params.petName,
      description: `${params.petName} is a ${petAssets.metadata.name} companion in the ${stageInfo.name} stage. ${stageInfo.description}. This Pet Pat grows stronger with each milestone achievement and evolves based on progress towards goals.`,
      image: nftImage,
      external_url: params.tokenId 
        ? `${this.BASE_URL}/pet/${params.tokenId}`
        : `${this.BASE_URL}/goal/${params.goalId}`,
      animation_url: petAssets.sprite, // Sprite sheet for animations
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
    petType: PetType,
    goalId: number,
    totalMilestones: number,
    goalTitle?: string
  ): GeneratedPetMetadata {
    return this.generatePetMetadata({
      petName,
      petType,
      stage: EvolutionStage.EGG,
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
    newStage: EvolutionStage,
    milestonesCompleted: number,
    level: number,
    experience: number,
    isHappy: boolean = true
  ): GeneratedPetMetadata {
    // Extract pet type from properties
    const petTypeKey = currentMetadata.properties.pet_type as keyof typeof PET_ASSETS
    const petType = Object.entries(PET_TYPE_NAMES).find(([_, key]) => key === petTypeKey)?.[0] as unknown as PetType
    
    if (petType === undefined) {
      throw new Error(`Invalid pet type: ${petTypeKey}`)
    }

    // Get existing attributes
    const existingGoalId = currentMetadata.attributes.find(attr => attr.trait_type === "Goal ID")?.value as number
    const existingTotalMilestones = currentMetadata.attributes.find(attr => attr.trait_type === "Total Milestones")?.value as number
    const existingPetName = currentMetadata.name
    const existingBirthTime = currentMetadata.attributes.find(attr => attr.trait_type === "Birth Time")?.value as number

    return this.generatePetMetadata({
      petName: existingPetName,
      petType,
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
      
      // Initialize Pinata SDK
      const pinata = initializePinata();
      
      console.log('📝 Preparing metadata for upload...');
      
      // Create filename
      const fileName = `${metadata.name}-metadata-${Date.now()}.json`;
      
      console.log('📤 Uploading metadata to Pinata...');
      
      // Upload JSON using Pinata SDK
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
      
      // Extract CID from response
      const ipfsHash = upload.cid;
      
      if (!ipfsHash) {
        throw new Error('No CID returned from Pinata SDK');
      }

      console.log('✅ Metadata uploaded to Pinata:', ipfsHash);
      
      // Verify the upload by trying to fetch it
      try {
        console.log('🔍 Verifying upload...');
        const gatewayUrl = await pinata.gateways.public.convert(ipfsHash);
        console.log('✅ Upload verification successful, Gateway URL:', gatewayUrl);
      } catch (verifyError) {
        console.warn('⚠️ Could not verify upload, but upload seems successful');
      }
      
      return ipfsHash;

    } catch (error) {
      console.error('❌ Failed to upload metadata to Pinata:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('PINATA_JWT')) {
          throw new Error('Pinata JWT token not configured. Please add NEXT_PUBLIC_PINATA_JWT to your environment variables.');
        } else if (error.message.includes('PINATA_GATEWAY')) {
          throw new Error('Pinata Gateway not configured. Please add NEXT_PUBLIC_PINATA_GATEWAY to your environment variables.');
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          throw new Error('Pinata authentication failed. Please check your JWT token.');
        } else if (error.message.includes('403') || error.message.includes('forbidden')) {
          throw new Error('Pinata access forbidden. Check your account permissions and quota.');
        } else if (error.message.includes('429')) {
          throw new Error('Pinata rate limit exceeded. Please try again later.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Test Pinata SDK connection
   */
  static async testPinataConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Pinata SDK connection...');
      
      // Initialize Pinata SDK
      const pinata = initializePinata();
      
      // Test with a simple JSON upload
      const testData = {
        message: "Hello from PatPet!",
        timestamp: Date.now()
      };

      const upload = await pinata.upload.public
        .json(testData)
        .name('pinata-connection-test.json')
        .keyvalues({
          type: 'connection_test'
        });

      if (upload.cid) {
        console.log('✅ Pinata SDK connection test successful:', upload.cid);
        return true;
      } else {
        console.error('❌ Pinata SDK connection test failed: No CID returned');
        return false;
      }
    } catch (error) {
      console.error('❌ Pinata SDK connection test error:', error);
      return false;
    }
  }

  /**
   * Get pet image URL for display
   */
  static getPetImageUrl(petType: PetType, stage: EvolutionStage): string {
    const petTypeKey = PET_TYPE_NAMES[petType]
    const stageKey = EVOLUTION_STAGE_NAMES[stage]

    console.log("test", PET_ASSETS[petTypeKey].images[stageKey])

    return PET_ASSETS[petTypeKey].images[stageKey]
  }

  /**
   * Get pet sprite URL for animations
   */
  static getPetSpriteUrl(petType: PetType): string {
    const petTypeKey = PET_TYPE_NAMES[petType]
    return PET_ASSETS[petTypeKey].sprite
  }

  /**
   * Get pet type metadata
   */
  static getPetTypeMetadata(petType: PetType) {
    const petTypeKey = PET_TYPE_NAMES[petType]
    return PET_ASSETS[petTypeKey].metadata
  }

  /**
   * Calculate rarity based on evolution stage and progress
   */
  private static calculateRarity(
    stage: EvolutionStage, 
    milestonesCompleted: number, 
    totalMilestones: number
  ): string {
    // Base rarity on evolution stage
    if (stage === EvolutionStage.ADULT) {
      return "Legendary" // Completed goal
    } else if (stage === EvolutionStage.BABY) {
      return "Rare" // Halfway evolved
    } else {
      // EGG stage - check progress
      const progress = totalMilestones > 0 ? milestonesCompleted / totalMilestones : 0
      if (progress >= 0.25) return "Uncommon" // Some progress
      return "Common" // Just started
    }
  }

  /**
   * Parse metadata from IPFS hash using Pinata Gateway
   */
  static async fetchMetadataFromIPFS(ipfsHash: string) {
    try {
      // Try Pinata SDK first if available
      try {
        const pinata = initializePinata();
        const data = await pinata.gateways.public.get(ipfsHash);
        return data ;
      } catch (sdkError) {
        console.warn('⚠️ Pinata SDK fetch failed, falling back to direct gateway');
      }

      // Fallback to direct gateway fetch
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
  testPinataConnection
} = PetMetadataHelper