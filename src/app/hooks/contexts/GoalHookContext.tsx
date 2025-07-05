"use client"
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Address, formatUnits, parseUnits } from 'viem'
import {PAT_GOAL_MANAGER_ABI, PAT_GOAL_MANAGER_ADDRESS} from '../../contracts/PatGoalManager'
import { TransactionState, TransactionType, useTransactions } from '../useTransactions'
import { PATNFT_ABI, PATNFT_ADDRESS } from '@/app/contracts/PatNFT'
import { PATTOKEN_ADDRESS } from '@/app/contracts/PATToken'

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

export interface GoalBasicInfo {
  owner: Address
  stakeAmount: bigint
  endTime: number
  status: GoalStatus
  milestonesCompleted: number
  totalMilestones: number
}

export interface FormattedGoalInfo {
  goalId: number
  owner: Address
  stakeAmount: string
  endTime: Date
  status: GoalStatus
  statusText: string
  milestonesCompleted: number
  totalMilestones: number
  progressPercentage: number
  isActive: boolean
  isExpired: boolean
}

export interface PetBasicInfo {
  owner: Address
  experience: bigint
  level: number
  petType: PetType
  stage: EvolutionStage
  goalId: number
  milestonesCompleted: number
}

export interface FormattedPetInfo {
  tokenId: number
  owner: Address
  experience: string
  level: number
  petType: PetType
  petTypeName: string
  petTypeEmoji: string
  stage: EvolutionStage
  stageName: string
  stageEmoji: string
  goalId: number
  milestonesCompleted: number
  evolutionProgress: {
    current: EvolutionStage
    next: EvolutionStage | null
    milestonesUntilNext: number
    progressPercentage: number
  }
}

interface GoalContextValue {
  // Goal creation
  createGoalWithMilestones: (params: CreateGoalParams) => Promise<void>
  
  // Goal data
  goalInfo: FormattedGoalInfo | null
  petInfo: FormattedPetInfo | null
  isLoadingGoal: boolean
  isLoadingPet: boolean
  errorGoal: Error | null
  errorPet: Error | null
  refetchGoalData: () => void
  refetchPetData: () => void
  
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
  
  // State for tracking the latest created goal
  const [latestGoalId, setLatestGoalId] = useState<number | null>(null)
  const [latestPetTokenId, setLatestPetTokenId] = useState<number | null>(null)
  
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
  
  // Read goal basic info
  const { 
    data: goalBasicInfo, 
    isLoading: isLoadingGoal, 
    error: errorGoal, 
    refetch: refetchGoal 
  } = useReadContract({
    address: PAT_GOAL_MANAGER_ADDRESS,
    abi: PAT_GOAL_MANAGER_ABI,
    functionName: 'getGoalBasicInfo',
    args: latestGoalId !== null ? [BigInt(latestGoalId)] : undefined,
    query: {
      enabled: latestGoalId !== null,
    }
  })
  
  // Read pet basic info
  const { 
    data: petBasicInfo, 
    isLoading: isLoadingPet, 
    error: errorPet, 
    refetch: refetchPet 
  } = useReadContract({
    address: PATNFT_ADDRESS,
    abi: PATNFT_ABI,
    functionName: 'getPetBasicInfo',
    args: latestPetTokenId !== null ? [BigInt(latestPetTokenId)] : undefined,
    query: {
      enabled: latestPetTokenId !== null,
    }
  })
  
  // Helper functions
  const getPetTypeName = (petType: PetType): string => {
    const types = ["Dragon", "Cat", "Plant"]
    return types[petType] || "Unknown"
  }
  
  const getPetTypeEmoji = (petType: PetType): string => {
    const emojis = ["🐉", "🐱", "🌱"]
    return emojis[petType] || "❓"
  }
  
  const getStageName = (stage: EvolutionStage): string => {
    const stages = ["Egg", "Baby", "Adult"]
    return stages[stage] || "Unknown"
  }
  
  const getStageEmoji = (stage: EvolutionStage): string => {
    const emojis = ["🥚", "👶", "🦸"]
    return emojis[stage] || "❓"
  }
  
  const getStatusText = (status: GoalStatus): string => {
    switch (status) {
      case GoalStatus.ACTIVE: return "Active"
      case GoalStatus.COMPLETED: return "Completed"
      case GoalStatus.FAILED: return "Failed"
      default: return "Unknown"
    }
  }
  
  // Format pet info - FIXED VERSION with BigInt conversion
const formattedPetInfo = useMemo((): FormattedPetInfo | null => {
    if (!petBasicInfo || latestPetTokenId === null) return null
    
    const [owner, experience, level, petType, stage, goalId, milestonesCompleted] = petBasicInfo as any[]
    
    // Convert BigInt values to numbers for calculations
    const milestonesNum = Number(milestonesCompleted) // Convert BigInt to number
    const levelNum = Number(level) // Convert BigInt to number (if it's also BigInt)
    const goalIdNum = Number(goalId) // Convert BigInt to number (if it's also BigInt)
    
    // Calculate evolution progress
    const getEvolutionProgress = (milestones: number) => {
      if (milestones >= EVOLUTION_THRESHOLDS.ADULT_THRESHOLD) {
        return {
          current: EvolutionStage.ADULT,
          next: null,
          milestonesUntilNext: 0,
          progressPercentage: 100
        }
      } else if (milestones >= EVOLUTION_THRESHOLDS.BABY_THRESHOLD) {
        return {
          current: EvolutionStage.BABY,
          next: EvolutionStage.ADULT,
          milestonesUntilNext: EVOLUTION_THRESHOLDS.ADULT_THRESHOLD - milestones,
          progressPercentage: 50 + ((milestones - EVOLUTION_THRESHOLDS.BABY_THRESHOLD) * 25)
        }
      } else {
        return {
          current: EvolutionStage.EGG,
          next: EvolutionStage.BABY,
          milestonesUntilNext: EVOLUTION_THRESHOLDS.BABY_THRESHOLD - milestones,
          progressPercentage: milestones * 25
        }
      }
    }
    
    return {
      tokenId: latestPetTokenId,
      owner,
      experience: formatUnits(experience, 0), // Experience is stored as integer
      level: levelNum, // Use converted number
      petType,
      petTypeName: getPetTypeName(petType),
      petTypeEmoji: getPetTypeEmoji(petType),
      stage,
      stageName: getStageName(stage),
      stageEmoji: getStageEmoji(stage),
      goalId: goalIdNum, // Use converted number
      milestonesCompleted: milestonesNum, // Use converted number
      evolutionProgress: getEvolutionProgress(milestonesNum) // Use converted number
    }
  }, [petBasicInfo, latestPetTokenId])
  
  // Also fix the formattedGoalInfo to handle BigInt properly
  const formattedGoalInfo = useMemo((): FormattedGoalInfo | null => {
    if (!goalBasicInfo || latestGoalId === null) return null
    
    const [owner, stakeAmount, endTime, status, milestonesCompleted, totalMilestones] = goalBasicInfo as any[]
    
    // Convert BigInt values to numbers for calculations
    const milestonesCompletedNum = Number(milestonesCompleted)
    const totalMilestonesNum = Number(totalMilestones)
    const endTimeNum = Number(endTime)
    
    const progressPercentage = totalMilestonesNum > 0 ? (milestonesCompletedNum * 100) / totalMilestonesNum : 0
    const endDate = new Date(endTimeNum * 1000)
    const isExpired = Date.now() > endDate.getTime()
    const isActive = status === GoalStatus.ACTIVE
    
    return {
      goalId: latestGoalId,
      owner,
      stakeAmount: formatUnits(stakeAmount, 18),
      endTime: endDate,
      status,
      statusText: getStatusText(status),
      milestonesCompleted: milestonesCompletedNum, // Use converted number
      totalMilestones: totalMilestonesNum, // Use converted number
      progressPercentage,
      isActive,
      isExpired
    }
  }, [goalBasicInfo, latestGoalId])
  
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
        spenderAddress: PAT_GOAL_MANAGER_ADDRESS, // Goal manager needs approval to transfer tokens
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
    
    // Execute transaction (handles approval + execution automatically)
    await execute(transactionRequest)
  }
  
  // Listen for successful transaction completion and extract goal/pet IDs
  useEffect(() => {
    if (transactionState.isCompleted && transactionState.transactionType === 'createGoal') {
      console.log('🎉 Goal creation completed! Extracting goal and pet IDs...')
      
      // In a real implementation, you would parse the transaction receipt
      // to extract the goalId and petTokenId from the GoalCreated event
      // For now, we'll simulate this by setting placeholder values
      
      // TODO: Parse transaction receipt to get actual IDs
      // const receipt = await provider.getTransactionReceipt(transactionState.txHash)
      // const goalCreatedEvent = parseGoalCreatedEvent(receipt.logs)
      // setLatestGoalId(goalCreatedEvent.args.goalId)
      // setLatestPetTokenId(goalCreatedEvent.args.petTokenId)
      
      // Temporary simulation - in real app, extract from transaction events
      setTimeout(() => {
        console.log('📋 Simulating goal/pet ID extraction...')
        // These would come from parsing the transaction receipt
        setLatestGoalId(1) // Placeholder
        setLatestPetTokenId(1) // Placeholder
      }, 1000)
    }
  }, [transactionState.isCompleted, transactionState.transactionType])
  
  const contextValue: GoalContextValue = {
    // Goal creation
    createGoalWithMilestones,
    
    // Goal data
    goalInfo: formattedGoalInfo,
    petInfo: formattedPetInfo,
    isLoadingGoal,
    isLoadingPet,
    errorGoal: errorGoal || null,
    errorPet: errorPet || null,
    refetchGoalData: refetchGoal,
    refetchPetData: refetchPet,
    
    // Transaction state
    transactionState,
    resetTransaction: reset,
    
    // Helper functions
    validateGoalCreation,
    getEvolutionPrediction,
    
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