"use client"
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Address, formatUnits, parseUnits } from 'viem'
import { useQuery, useMutation } from '@apollo/client'
import { PAT_GOAL_MANAGER_ABI, PAT_GOAL_MANAGER_ADDRESS } from '../../contracts/PatGoalManager'
import { TransactionState, TransactionType, useTransactions } from '../useTransactions'
import { PATNFT_ABI, PATNFT_ADDRESS } from '@/app/contracts/PatNFT'
import { PATTOKEN_ADDRESS } from '@/app/contracts/PATToken'
import { 
  GET_USER_DASHBOARD, 
  GET_GOAL_PROGRESS,
  GET_VALIDATION_REQUESTS,
  GET_USER_PENDING_MILESTONES,
  formatGoalData, 
  formatPetData,
  Goal,
  Pet,
  Milestone,
  UserStats,
  ValidationRequest
} from '@/lib/graphql'

// Pet types enum
export enum PetType {
  DRAGON = 0,
  CAT = 1,
  PLANT = 2
}

// Goal status enum
export enum GoalStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  FAILED = 2
}

// Evolution stages enum
export enum EvolutionStage {
  EGG = 0,
  BABY = 1,
  ADULT = 2
}

export interface CreateGoalParams {
  title: string
  stakeAmount: string
  durationDays: number
  petName: string
  petType: PetType
  petMetadataIPFS: string
  milestoneDescriptions: string[]
}

export interface FormattedGoalInfo extends Goal {
  stakeAmountFormatted: string
  endDate: Date
  createdDate: Date
  progressPercentage: number
  isExpired: boolean
  daysRemaining: number
  statusText: string
}

export interface FormattedPetInfo extends Pet {
  experienceFormatted: string
  evolutionProgress: {
    current: string
    next: string | null
    progress: number
    milestonesUntilNext: number
  }
  imageUrl: string
  spriteUrl: string
  petTypeName: string
  petTypeEmoji: string
  stageName: string
  stageEmoji: string
}

export interface SubmitMilestoneParams {
  milestoneId: string
  evidenceFile: File
}

interface GoalContextValue {
  // Goal creation
  createGoalWithMilestones: (params: CreateGoalParams) => Promise<void>
  
  // Milestone submission  
  submitMilestone: (params: SubmitMilestoneParams) => Promise<void>
  
  // Dashboard data
  userGoals: FormattedGoalInfo[]
  userPets: FormattedPetInfo[]
  userStats: UserStats | null
  isLoadingDashboard: boolean
  errorDashboard: any
  refetchDashboard: () => void
  
  // Current goal/pet (for detailed view)
  currentGoal: FormattedGoalInfo | null
  currentPet: FormattedPetInfo | null
  currentMilestones: Milestone[]
  setCurrentGoalId: (goalId: string | null) => void
  
  // Validation data (for admin/validators)
  validationRequests: ValidationRequest[]
  userPendingMilestones: Milestone[]
  isLoadingValidations: boolean
  refetchValidations: () => void
  
  // Transaction state
  transactionState: TransactionState
  resetTransaction: () => void
  
  // Helper functions
  validateGoalCreation: (params: CreateGoalParams) => string[]
  getEvolutionPrediction: (milestones: number) => {
    stage: EvolutionStage
    nextStage: EvolutionStage | null
    progressPercentage: number
    milestonesUntilNext: number
  }
  
  // System data
  nextGoalId: number
  
  // Constants
  MAX_MILESTONES: number
  EVOLUTION_THRESHOLDS: {
    BABY_THRESHOLD: number
    ADULT_THRESHOLD: number
  }
  XP_CONSTANTS: {
    PER_MILESTONE: number
    COMPLETION_BONUS: number
  }
}

const GoalContext = createContext<GoalContextValue | undefined>(undefined)

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const { address: userAddress } = useAccount()
  const { execute, transactionState, reset } = useTransactions()
  
  // State for current goal view
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null)
  
  // Read nextGoalId from contract
  const { 
    data: systemStatsData,
    refetch: systemStatsDataRefetch 
  } = useReadContract({
    address: PAT_GOAL_MANAGER_ADDRESS,
    abi: PAT_GOAL_MANAGER_ABI,
    functionName: 'getSystemStats',
    query: {
      enabled: true,
    }
  })
  
  // Constants from contracts
  const MAX_MILESTONES = 4
  const EVOLUTION_THRESHOLDS = {
    BABY_THRESHOLD: 2,
    ADULT_THRESHOLD: 4
  }
  const XP_CONSTANTS = {
    PER_MILESTONE: 25,
    COMPLETION_BONUS: 100
  }
  
  // ============ GRAPHQL QUERIES ============
  
  // User Dashboard Query
  const { 
    data: dashboardData, 
    loading: isLoadingDashboard, 
    error: errorDashboard,
    refetch: refetchDashboard 
  } = useQuery(GET_USER_DASHBOARD, {
    variables: { userAddress: userAddress || '' },
    skip: !userAddress,
    pollInterval: 5000, // Poll every 5 seconds for real-time updates
  })
  
  // Current Goal Progress Query
  const { 
    data: goalProgressData,
    refetch: refetchGoalProgress 
  } = useQuery(GET_GOAL_PROGRESS, {
    variables: { goalId: currentGoalId || '' },
    skip: !currentGoalId,
    pollInterval: 3000, // More frequent updates for active goal
  })
  
  // Validation Requests Query (for admin/validators)
  const { 
    data: validationData,
    loading: isLoadingValidations,
    refetch: refetchValidations
  } = useQuery(GET_VALIDATION_REQUESTS, {
    variables: { status: 'PENDING', first: 20, skip: 0 },
    pollInterval: 10000, // Poll every 10 seconds for validation updates
  })
  
  // User Pending Milestones Query
  const { 
    data: pendingMilestonesData 
  } = useQuery(GET_USER_PENDING_MILESTONES, {
    variables: { userAddress: userAddress || '' },
    skip: !userAddress,
    pollInterval: 10000,
  })
  
  // ============ FORMAT DATA ============
  const getStatusText = (status: string): string => {
    const statusTexts: Record<string, string> = {
      'ACTIVE': 'Active',
      'COMPLETED': 'Completed',
      'FAILED': 'Failed'
    }
    return statusTexts[status] || 'Unknown'
  }

    // ============ HELPER FUNCTIONS ============
  
    const getPetTypeName = (petType: string): string => {
      const types: Record<string, string> = {
        'DRAGON': 'Dragon',
        'CAT': 'Cat', 
        'PLANT': 'Plant'
      }
      return types[petType] || 'Unknown'
    }
    
    const getPetTypeEmoji = (petType: string): string => {
      const emojis: Record<string, string> = {
        'DRAGON': '🐉',
        'CAT': '🐱',
        'PLANT': '🌱'
      }
      return emojis[petType] || '❓'
    }
    
    const getStageName = (stage: string): string => {
      const stages: Record<string, string> = {
        'EGG': 'Egg',
        'BABY': 'Baby',
        'ADULT': 'Adult'
      }
      return stages[stage] || 'Unknown'
    }
    
    const getStageEmoji = (stage: string): string => {
      const emojis: Record<string, string> = {
        'EGG': '🥚',
        'BABY': '👶', 
        'ADULT': '🦸'
      }
      return emojis[stage] || '❓'
    }
    
  
  // Get next goal ID from contract
  const nextGoalId = useMemo(() => {
    let system = systemStatsData as any
    if (system) {
      return Number(system[0]); // nextGoalId
    }

    return 1;
  }, [systemStatsData]);
  
  // Format user goals
  const userGoals = useMemo((): FormattedGoalInfo[] => {
    if (!dashboardData?.goals?.items) return []

    console.log("USER GOALS", dashboardData.goals.items)
    
    return dashboardData.goals.items.map((goal: Goal) => ({
      ...formatGoalData(goal),
      statusText: getStatusText(goal.status as any),
    }))
  }, [dashboardData?.goals])
  
  // Format user pets
  const userPets = useMemo((): FormattedPetInfo[] => {
    if (!dashboardData?.pets?.items) return []

    console.log("USER PETS", dashboardData.pets.items)
    
    return dashboardData.pets.items.map((pet: Pet) => ({
      ...formatPetData(pet),
      petTypeName: getPetTypeName(pet.petType),
      petTypeEmoji: getPetTypeEmoji(pet.petType),
      stageName: getStageName(pet.evolutionStage),
      stageEmoji: getStageEmoji(pet.evolutionStage),
    }))
  }, [dashboardData?.pets])
  
  // Format current goal
  const currentGoal = useMemo((): FormattedGoalInfo | null => {
    if (!goalProgressData?.goals?.items?.[0]) return null
    
    const goal = goalProgressData.goals.items[0]
    return {
      ...formatGoalData(goal),
      statusText: getStatusText(goal.status as any),
    }
  }, [goalProgressData?.goals])
  
  // Format current pet
  const currentPet = useMemo((): FormattedPetInfo | null => {
    if (!goalProgressData?.pets?.items?.[0]) return null
    
    const pet = goalProgressData.pets.items[0]
    return {
      ...formatPetData(pet),
      petTypeName: getPetTypeName(pet.petType),
      petTypeEmoji: getPetTypeEmoji(pet.petType),
      stageName: getStageName(pet.evolutionStage),
      stageEmoji: getStageEmoji(pet.evolutionStage),
    }
  }, [goalProgressData?.pets])
  


  // Validation function
  const validateGoalCreation = (params: CreateGoalParams): string[] => {
    const errors: string[] = []
    
    if (!params.title.trim()) {
      errors.push("Goal title is required")
    }
    
    if (params.title.length > 100) {
      errors.push("Goal title must be less than 100 characters")
    }
    
    if (!params.petName.trim()) {
      errors.push("Pet name is required")
    }
    
    if (params.petName.length > 50) {
      errors.push("Pet name must be less than 50 characters")
    }
    
    if (parseFloat(params.stakeAmount) <= 0) {
      errors.push("Stake amount must be greater than 0")
    }
    
    if (params.durationDays <= 0) {
      errors.push("Duration must be at least 1 day")
    }
    
    if (params.durationDays > 365) {
      errors.push("Duration cannot exceed 365 days")
    }
    
    if (params.milestoneDescriptions.length === 0) {
      errors.push("At least 1 milestone is required")
    }
    
    if (params.milestoneDescriptions.length > MAX_MILESTONES) {
      errors.push(`Maximum ${MAX_MILESTONES} milestones allowed`)
    }
    
    // Check individual milestone descriptions
    params.milestoneDescriptions.forEach((desc, index) => {
      if (!desc.trim()) {
        errors.push(`Milestone ${index + 1} description is required`)
      }
      if (desc.length > 200) {
        errors.push(`Milestone ${index + 1} description must be less than 200 characters`)
      }
    })
    
    if (!params.petMetadataIPFS.trim()) {
      errors.push("Pet metadata IPFS hash is required")
    }
    
    return errors
  }
  
  // Evolution prediction helper
  const getEvolutionPrediction = (milestones: number) => {
    if (milestones >= EVOLUTION_THRESHOLDS.ADULT_THRESHOLD) {
      return {
        stage: EvolutionStage.ADULT,
        nextStage: null,
        progressPercentage: 100,
        milestonesUntilNext: 0
      }
    } else if (milestones >= EVOLUTION_THRESHOLDS.BABY_THRESHOLD) {
      return {
        stage: EvolutionStage.BABY,
        nextStage: EvolutionStage.ADULT,
        progressPercentage: 50 + ((milestones - EVOLUTION_THRESHOLDS.BABY_THRESHOLD) * 25),
        milestonesUntilNext: EVOLUTION_THRESHOLDS.ADULT_THRESHOLD - milestones
      }
    } else {
      return {
        stage: EvolutionStage.EGG,
        nextStage: EvolutionStage.BABY,
        progressPercentage: milestones * 25,
        milestonesUntilNext: EVOLUTION_THRESHOLDS.BABY_THRESHOLD - milestones
      }
    }
  }
  
  // ============ TRANSACTION FUNCTIONS ============
  
  // Create goal with milestones function
  const createGoalWithMilestones = async (params: CreateGoalParams) => {
    if (!userAddress) {
      throw new Error('User not connected')
    }
    
    // Validate parameters
    const validationErrors = validateGoalCreation(params)
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`)
    }
    
    console.log('🚀 Starting createGoalWithMilestones transaction', {
      title: params.title,
      stakeAmount: params.stakeAmount,
      durationDays: params.durationDays,
      petName: params.petName,
      petType: params.petType,
      milestonesCount: params.milestoneDescriptions.length
    })
    
    const stakeAmountInWei = parseUnits(params.stakeAmount, 18)
    
    // Create transaction request
    const transactionRequest = {
      type: 'createGoal' as TransactionType,
      writeContract: {
        address: PAT_GOAL_MANAGER_ADDRESS,
        abi: PAT_GOAL_MANAGER_ABI,
        functionName: 'createGoalWithMilestones',
        args: [
          params.title,
          stakeAmountInWei,
          params.durationDays,
          params.petName,
          params.petType,
          params.petMetadataIPFS,
          params.milestoneDescriptions
        ],
      },
      // Token approval required for PAT tokens
      approval: {
        tokenAddress: PATTOKEN_ADDRESS,
        tokenAmount: stakeAmountInWei,
        spenderAddress: PAT_GOAL_MANAGER_ADDRESS,
      },
      metadata: {
        asset: 'PAT',
        amount: params.stakeAmount,
        decimals: 18,
        goalTitle: params.title,
        petName: params.petName,
        milestonesCount: params.milestoneDescriptions.length,
      }
    }
    
    // Execute transaction
    await execute(transactionRequest)
  }
  
  // Submit milestone evidence function
  const submitMilestone = async (params: SubmitMilestoneParams) => {
    if (!userAddress) {
      throw new Error('User not connected')
    }
    
    console.log('🚀 Starting milestone submission', params)
    
    // TODO: Upload evidence to IPFS using Pinata
    // For now, use placeholder IPFS hash
    const evidenceIPFS = "QmPlaceholderEvidenceHash" // This should be actual upload result
    
    // Create transaction request
    const transactionRequest = {
      type: 'submitMilestone' as TransactionType,
      writeContract: {
        address: PAT_GOAL_MANAGER_ADDRESS,
        abi: PAT_GOAL_MANAGER_ABI,
        functionName: 'submitMilestone',
        args: [
          params.milestoneId,
          evidenceIPFS
        ],
      },
      metadata: {
        milestoneId: params.milestoneId,
        evidenceType: params.evidenceFile.type,
        evidenceSize: params.evidenceFile.size,
      }
    }
    
    // Execute transaction
    await execute(transactionRequest)
  }
  
  // ============ EFFECTS ============
  
  // Listen for successful transaction completion and refetch data
  useEffect(() => {
    if (transactionState.isCompleted) {
      console.log('🎉 Transaction completed! Refetching data...')
      
      if (transactionState.transactionType === 'createGoal') {
        // Refetch dashboard data and system stats after goal creation
        refetchDashboard()
        systemStatsDataRefetch()
      } else if (transactionState.transactionType === 'submitMilestone') {
        // Refetch goal progress and validations after milestone submission
        refetchGoalProgress()
        refetchValidations()
      }
    }
  }, [transactionState.isCompleted, transactionState.transactionType, refetchDashboard, refetchGoalProgress, refetchValidations, systemStatsDataRefetch])
  
  const contextValue: GoalContextValue = {
    // Goal creation
    createGoalWithMilestones,
    
    // Milestone submission
    submitMilestone,
    
    // Dashboard data
    userGoals,
    userPets,
    userStats: dashboardData?.userStats || null,
    isLoadingDashboard,
    errorDashboard,
    refetchDashboard,
    
    // Current goal/pet
    currentGoal,
    currentPet,
    currentMilestones: goalProgressData?.milestones?.items || [],
    setCurrentGoalId,
    
    // Validation data
    validationRequests: validationData?.validationRequests?.items || [],
    userPendingMilestones: pendingMilestonesData?.milestones?.items || [],
    isLoadingValidations,
    refetchValidations,
    
    // Transaction state
    transactionState,
    resetTransaction: reset,
    
    // Helper functions
    validateGoalCreation,
    getEvolutionPrediction,
    
    // System data
    nextGoalId,
    
    // Constants
    MAX_MILESTONES,
    EVOLUTION_THRESHOLDS,
    XP_CONSTANTS,
  }
  
  return (
    <GoalContext.Provider value={contextValue}>
      {children}
    </GoalContext.Provider>
  )
}

export function useGoal() {
  const context = useContext(GoalContext)
  if (!context) {
    throw new Error('useGoal must be used within GoalProvider')
  }
  return context
}