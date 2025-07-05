// lib/graphql.ts
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { PetMetadataHelper } from '@/lib/metaDataHelper';
import { formatEther, parseEther } from 'viem';

// Create HTTP link to Ponder GraphQL endpoint  
const httpLink = createHttpLink({
  uri: 'https://patpet-ponder-indexer-production.up.railway.app/graphql', //
});

// Create Apollo Client with optimized cache configuration
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Configure caching for paginated results
          goalss: {
            merge: false, // Don't merge, replace completely
            keyArgs: ['orderBy', 'orderDirection', 'limit'],
          },
          petss: {
            merge: false,
            keyArgs: ['orderBy', 'orderDirection', 'limit'],
          },
          milestoness: {
            merge: false,
            keyArgs: ['orderBy', 'orderDirection', 'limit'],
          },
          validationRequestss: {
            merge: false,
            keyArgs: ['orderBy', 'orderDirection', 'limit'],
          },
        },
      },
      // Cache individual records by ID
      Goal: {
        keyFields: ['id'],
      },
      Pet: {
        keyFields: ['id'],
      },
      Milestone: {
        keyFields: ['id'],
      },
      ValidationRequest: {
        keyFields: ['id'],
      },
      UserStats: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: false,
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
  connectToDevTools: process.env.NODE_ENV === 'development',
});

// ============ QUERIES ============

// User Dashboard - Get all user data
export const GET_USER_DASHBOARD = gql`
  query GetUserDashboard($userAddress: String!) {
    goals: goalss(
      where: { owner: $userAddress }
      orderBy: "createdAt"
      orderDirection: "desc"
    ) {
      items {
        id
        owner
        petTokenId
        title
        stakeAmount
        totalMilestones
        milestonesCompleted
        petName
        petType
        status
        endTime
        createdAt
      }
    }
    
    pets: petss(
      where: { owner: $userAddress }
      orderBy: "id"
      orderDirection: "asc"
    ) {
      items {
        id
        goalId
        owner
        name
        petType
        evolutionStage
        experience
        milestonesCompleted
        metadataIPFS
      }
    }
    
    userStats(id: $userAddress) {
      id
      totalGoals
      completedGoals
      activeGoals
      totalRewardsEarned
    }
  }
`;

// Goal Progress - Get specific goal with milestones
export const GET_GOAL_PROGRESS = gql`
  query GetGoalProgress($goalId: String!) {
    goals: goalss(where: { id: $goalId }) {
      items {
        id
        owner
        petTokenId
        title
        stakeAmount
        totalMilestones
        milestonesCompleted
        petName
        petType
        status
        endTime
        createdAt
      }
    }
    
    milestones: milestoness(
      where: { goalId: $goalId }
      orderBy: "createdAt"
      orderDirection: "asc"
    ) {
      items {
        id
        goalId
        description
        isCompleted
        evidenceIPFS
        createdAt
      }
    }
    
    pets: petss(where: { goalId: $goalId }) {
      items {
        id
        goalId
        owner
        name
        petType
        evolutionStage
        experience
        milestonesCompleted
        metadataIPFS
      }
    }
  }
`;

// Pet Collection - Get all user pets
export const GET_USER_PETS = gql`
  query GetUserPets($userAddress: String!) {
    pets: petss(
      where: { owner: $userAddress }
      orderBy: "id"
      orderDirection: "asc"
    ) {
      items {
        id
        goalId
        owner
        name
        petType
        evolutionStage
        experience
        milestonesCompleted
        metadataIPFS
      }
    }
  }
`;

// Validation Requests - For validators/admins
export const GET_VALIDATION_REQUESTS = gql`
  query GetValidationRequests($status: validationStatus = PENDING, $limit: Int = 10) {
    validationRequests: validationRequestss(
      where: { status: $status, isResolved: false }
      orderBy: "createdAt"
      orderDirection: "desc"
      limit: $limit
    ) {
      items {
        id
        submitter
        goalId
        evidenceIPFS
        goalStakeAmount
        requiredValidators
        currentApprovals
        currentRejections
        status
        deadline
        isResolved
        createdAt
      }
    }
  }
`;

// User's Pending Milestones
export const GET_USER_PENDING_MILESTONES = gql`
  query GetUserPendingMilestones($userAddress: String!) {
    milestones: milestoness(
      where: { goalOwner: $userAddress, isCompleted: false }
      orderBy: "createdAt"
      orderDirection: "desc"
    ) {
      items {
        id
        goalId
        description
        isCompleted
        evidenceIPFS
        createdAt
      }
    }
  }
`;

// Recent Activity - For homepage/feed
export const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity($limit: Int = 10) {
    recentGoals: goalss(
      orderBy: "createdAt"
      orderDirection: "desc"
      limit: $limit
    ) {
      items {
        id
        owner
        title
        petName
        petType
        stakeAmount
        createdAt
      }
    }
    
    recentPets: petss(
      orderBy: "id"
      orderDirection: "desc"
      limit: $limit
    ) {
      items {
        id
        name
        petType
        evolutionStage
        milestonesCompleted
      }
    }
  }
`;

// Active Goals (for general stats)
export const GET_ACTIVE_GOALS = gql`
  query GetActiveGoals($limit: Int = 20) {
    goals: goalss(
      where: { status: "ACTIVE" }
      orderBy: "createdAt"
      orderDirection: "desc"
      limit: $limit
    ) {
      items {
        id
        owner
        title
        stakeAmount
        totalMilestones
        milestonesCompleted
        petName
        petType
        endTime
        createdAt
      }
    }
  }
`;

// System Stats - Get global goal counter
export const GET_SYSTEM_STATS = gql`
  query GetSystemStats {
    # Get the highest goal ID to determine next ID
    latestGoals: goalss(
      orderBy: "id"
      orderDirection: "desc"
      limit: 1
    ) {
      items {
        id
      }
    }
  }
`;

// Dashboard Summary - For analytics
export const GET_DASHBOARD_SUMMARY = gql`
  query GetDashboardSummary($userAddress: String) {
    # Recent goals
    recentGoals: goalss(
      orderBy: "createdAt"
      orderDirection: "desc"
      limit: 5
    ) {
      items {
        id
        title
        status
        milestonesCompleted
        totalMilestones
        createdAt
      }
    }
    
    # User stats (if userAddress provided)
    userStats(id: $userAddress) {
      totalGoals
      completedGoals
      activeGoals
      totalRewardsEarned
    }
  }
`;

// ============ TYPE DEFINITIONS ============

export interface Goal {
  id: string;
  owner: string;
  petTokenId: string;
  title: string;
  stakeAmount: string;
  totalMilestones: number;
  milestonesCompleted: number;
  petName: string;
  petType: 'DRAGON' | 'CAT' | 'PLANT';
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  endTime: string;
  createdAt: string;
}



export interface Pet {
  id: string;
  goalId: string;
  owner: string;
  name: string;
  petType: 'DRAGON' | 'CAT' | 'PLANT';
  evolutionStage: 'EGG' | 'BABY' | 'ADULT';
  experience: string;
  milestonesCompleted: number;
  metadataIPFS: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  description: string;
  isCompleted: boolean;
  evidenceIPFS?: string;
  createdAt: string;
}

export interface UserStats {
  id: string;
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  totalRewardsEarned: string;
}

export interface ValidationRequest {
  id: string;
  submitter: string;
  goalId: string;
  evidenceIPFS: string;
  goalStakeAmount: string;
  requiredValidators: number;
  currentApprovals: number;
  currentRejections: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED';
  deadline: string;
  isResolved: boolean;
  createdAt: string;
}

// ============ HELPER FUNCTIONS ============

export const formatGoalData = (goal: Goal) => ({
  ...goal,
  stakeAmountFormatted: formatEther(BigInt(goal.stakeAmount), 'wei').toString(),
  endDate: new Date(parseInt(goal.endTime) * 1000),
  createdDate: new Date(parseInt(goal.createdAt) * 1000),
  progressPercentage: goal.totalMilestones > 0 
    ? Math.round((goal.milestonesCompleted / goal.totalMilestones) * 100) 
    : 0,
  isExpired: Date.now() > parseInt(goal.endTime) * 1000,
  daysRemaining: Math.ceil((parseInt(goal.endTime) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)),
});

export const formatPetData = (pet: Pet) => ({
  ...pet,
  experienceFormatted: parseInt(pet.experience).toLocaleString(),
  evolutionProgress: getEvolutionProgress(pet.evolutionStage, pet.milestonesCompleted),
  // Use existing PetMetadataHelper functions - now works with strings
  imageUrl: PetMetadataHelper.getPetImageUrl(pet.petType, pet.evolutionStage),
  spriteUrl: PetMetadataHelper.getPetSpriteUrl(pet.petType),
});

export const getPetSpriteUrl = (petType: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_PAT_PET_PINATA_GATEWAY;
  
  if (petType === 'CAT') {
    return `${baseUrl}/ipfs/bafkreiaulxgnc5hstx47m66kc5bmbvllewplegjseggrqwsu5ibo2j42xm`;
  }
  
  // Add other pet types when available
  if (petType === 'DRAGON') {
    return `${baseUrl}/ipfs/bafkreicbmbbxnpyanm54ozwk27wtut6zvvo77g72zxb4jd6sfz7lx4p34i`;
  }
  
  if (petType === 'PLANT') {
    return `${baseUrl}/ipfs/bafkreifwsecavxtb3ovzr43bc2bskaiii43ixh6hxwrd2vpnglnpdrjed4`;
  }
  
  return `${baseUrl}/ipfs/placeholder-${petType.toLowerCase()}-sprite`;
};

export const getEvolutionProgress = (stage: string, milestones: number) => {
  const stages = ['EGG', 'BABY', 'ADULT'];
  const currentIndex = stages.indexOf(stage);
  
  if (currentIndex === stages.length - 1) {
    return { current: stage, next: null, progress: 100, milestonesUntilNext: 0 };
  }
  
  const thresholds = [0, 2, 4]; // EGG: 0, BABY: 2, ADULT: 4
  const nextThreshold = thresholds[currentIndex + 1];
  const currentThreshold = thresholds[currentIndex];
  
  const progress = currentThreshold === 0 
    ? (milestones / nextThreshold) * 50 
    : 50 + ((milestones - currentThreshold) / (nextThreshold - currentThreshold)) * 50;
  
  return {
    current: stage,
    next: stages[currentIndex + 1],
    progress: Math.min(progress, 100),
    milestonesUntilNext: Math.max(0, nextThreshold - milestones)
  };
};

// Simplified - PetMetadataHelper now handles all conversions internally

// Helper function to format BigInt values for GraphQL
export const formatBigIntForGraphQL = (value: bigint): string => {
  return value.toString();
};

// Helper function to parse BigInt values from GraphQL
export const parseBigIntFromGraphQL = (value: string): bigint => {
  return BigInt(value);
};

// Error handling helper
export const handleGraphQLError = (error: any) => {
  console.error('GraphQL Error:', error);
  
  if (error.networkError) {
    return 'Network error: Please check your connection and try again.';
  }
  
  if (error.graphQLErrors?.length > 0) {
    return `GraphQL error: ${error.graphQLErrors[0].message}`;
  }
  
  return 'An unexpected error occurred. Please try again.';
};