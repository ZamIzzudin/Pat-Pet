/** @format */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { EventBus, GAME_EVENTS } from "@/lib/eventBus";
import { useWeb3 } from "./Web3Provider";
import { PetType, useGoal, FormattedGoalInfo, FormattedPetInfo } from "@/app/hooks/contexts/GoalHookContext";
import { PetMetadataHelper } from "@/lib/metaDataHelper";

export default function ModalEvent({
  show,
  setShow,
}: {
  show: boolean;
  setShow: any;
}) {
  const { pets } = useWeb3();
  const [activeTab, setActiveTab] = useState("PAT_LIST");
  const [eventBus] = useState(() => EventBus.getInstance());

  return (
    <div
      className={`top-0 left-0 right-0 bottom-0 items-center justify-center bg-[#00000070] ${
        show ? "flex absolute z-[1000]" : " hidden"
      }`}
      onClick={(e) => {
        setShow();
        eventBus.emit(GAME_EVENTS.MODAL_HIDE);
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="bg-[#c49a6c] text-white w-[80dvw] h-[80dvh] flex items-center justify-center relative border-[10px] border-[#6b4b5b]"
      >
        <button
          className="absolute top-0 right-0 w-[50px] aspect-square text-[24px] cursor-pointer z-100"
          onClick={() => {
            setShow();
            eventBus.emit(GAME_EVENTS.MODAL_HIDE);
          }}
        >
          x
        </button>
        <div className="flex w-full h-full">
          <aside className="w-[20%] p-3 border-r-[5px] border-[#6b4b5b]">
            <ul className="flex flex-col gap-3">
              <li
                className={`${
                  activeTab === "PAT_LIST" ? "bg-[#6b4b5b]" : "bg-[#92848b]"
                } p-3 cursor-pointer duration-300`}
                onClick={() => setActiveTab("PAT_LIST")}
              >
                PAT LIST
              </li>
              <li
                className={`${
                  activeTab === "VERIFICATION" ? "bg-[#6b4b5b]" : "bg-[#92848b]"
                } p-3 cursor-pointer duration-300`}
                onClick={() => setActiveTab("VERIFICATION")}
              >
                VERIFICATION
              </li>
            </ul>
          </aside>
          <div className="flex-grow flex items-center justify-center">
            <Renderer
              tab={activeTab}
              handler={(tab: string) => setActiveTab(tab)}
              data={pets}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Renderer({
  tab,
  handler,
  data // this are mock data we dont use this,
}: {
  tab: string;
  handler: (tab: string) => void;
  data: any[];
}) {
  const { 
    createGoalWithMilestones, 
    transactionState, 
    userGoals,
    userPets,
    userStats,
    validationRequests,
    isLoadingDashboard,
    isLoadingValidations,
    resetTransaction,
    setCurrentGoalId,
    nextGoalId // Get real nextGoalId from contract
  } = useGoal();

  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FormattedGoalInfo | null>(null);

  // We no longer need to calculate nextGoalId - it comes from the contract
  // useEffect removed

  // Log pet info for debugging
  useEffect(() => {
    if (userPets && userPets.length > 0) {
      console.log("User Pets:", userPets);
    }
    console.log("Next Goal ID from contract:", nextGoalId);
  }, [userPets, nextGoalId]);

  const mintPet = async () => {
    try {
      setIsCreatingGoal(true);
      console.log('🚀 Starting test goal creation...');
      console.log('Next Goal ID will be:', nextGoalId);

      // Hardcoded test goal data
      const testGoalData = {
        title: `Complete Fitness Challenge #${nextGoalId}`,
        stakeAmount: "50", // 50 PAT tokens
        durationDays: 30,
        petName: `FitBuddy${nextGoalId}`,
        petType: PetType.CAT, // Using CAT since it has real IPFS URLs
        petMetadataIPFS: "", // Will be generated
        milestoneDescriptions: [
          "Complete Week 1: Basic exercises daily",
          "Complete Week 2: Increase workout intensity", 
          "Complete Week 3: Add cardio routine",
          "Complete Week 4: Final fitness assessment"
        ]
      };

      // Step 1: Generate pet metadata with real goal ID
      console.log('📝 Generating pet metadata...');
      const initialMetadata = PetMetadataHelper.generateInitialPetMetadata(
        testGoalData.petName,
        testGoalData.petType,
        nextGoalId, // Use real nextGoalId from contract
        testGoalData.milestoneDescriptions.length,
        testGoalData.title
      );

      console.log('Generated metadata:', initialMetadata);

      // Step 2: Upload metadata to Pinata
      const ipfsHash = await PetMetadataHelper.uploadMetadataToPinata(
        initialMetadata,
      );

      console.log('✅ Metadata uploaded, IPFS hash:', ipfsHash);

      // Step 3: Create goal with metadata
      const goalDataWithMetadata = {
        ...testGoalData,
        petMetadataIPFS: ipfsHash
      };

      console.log('🎯 Creating goal with milestones...');
      await createGoalWithMilestones(goalDataWithMetadata);

      // Note: Goal ID will be auto-incremented by the contract
      // Our Ponder indexer will pick up the actual goalId from the GoalCreated event

    } catch (error) {
      console.error('❌ Failed to create test goal:', error);
      alert(`Failed to create goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingGoal(false);
    }
  };

  // Reset transaction when modal closes
  const handleReset = () => {
    resetTransaction();
    handler("PAT_LIST");
  };

  const handleGoalSelect = (goal: FormattedGoalInfo) => {
    setSelectedGoal(goal);
    setCurrentGoalId(goal.id);
    console.log('Selected goal:', goal);
  };

  if (tab === "PAT_LIST") {
    return (
      <div className="flex p-3 w-full h-full relative flex-col items-start justify-start gap-3 overflow-y-auto">
        <h1 className="text-[24px]">PAT LIST</h1>
        
        {/* Loading State */}
        {isLoadingDashboard && (
          <div className="flex items-center justify-center w-full h-32">
            <p className="text-[#eeff82]">Loading your pets and goals...</p>
          </div>
        )}

        {/* User Stats */}
        {userStats && (
          <div className="bg-[#6b4b5b] p-3 rounded w-full">
            <h3 className="text-[18px] mb-2">Your Stats:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>Total Goals: {userStats.totalGoals}</p>
              <p>Completed: {userStats.completedGoals}</p>
              <p>Active Goals: {userStats.activeGoals}</p>
              <p>Rewards: {parseFloat(userStats.totalRewardsEarned).toFixed(2)} PAT</p>
            </div>
            <p className="text-xs text-[#eeff82] mt-1">
              Next Goal ID: #{nextGoalId}
            </p>
          </div>
        )}

        {/* Goals List */}
        {userGoals.length > 0 && (
          <div className="bg-[#6b4b5b] p-3 rounded w-full">
            <h3 className="text-[18px] mb-2">Your Goals ({userGoals.length}):</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {userGoals.map((goal) => (
                <div 
                  key={goal.id}
                  className={`bg-[#92848b] p-2 rounded cursor-pointer hover:bg-[#7a7082] transition-colors ${
                    selectedGoal?.id === goal.id ? 'ring-2 ring-[#eeff82]' : ''
                  }`}
                  onClick={() => handleGoalSelect(goal)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{goal.title}</p>
                      <p className="text-sm text-[#eeff82]">
                        Progress: {goal.milestonesCompleted}/{goal.totalMilestones} milestones
                      </p>
                      <p className="text-xs">
                        Status: {goal.statusText} | Stake: {goal.stakeAmountFormatted} PAT
                      </p>
                      <p className="text-xs">Goal ID: #{goal.id}</p>
                    </div>
                    <div className="text-right">
                      <div className="w-12 h-12 bg-[#6b4b5b] rounded flex items-center justify-center">
                        <span className="text-xs">{goal.progressPercentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pets Collection */}
        {userPets.length > 0 && (
          <div className="bg-[#6b4b5b] p-3 rounded w-full">
            <h3 className="text-[18px] mb-2">Your Pet Collection ({userPets.length}):</h3>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {userPets.map((pet) => (
                <div key={pet.id} className="bg-[#92848b] p-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src={pet.imageUrl}
                      alt={pet.name}
                      width={60}
                      height={60}
                      className="rounded"
                      onError={(e) => {
                        // Fallback image if IPFS fails
                        e.currentTarget.src = '/placeholder-pet.png';
                      }}
                    />
                    <div>
                      <p className="font-semibold">{pet.name}</p>
                      <p className="text-sm text-[#eeff82]">
                        {pet.petTypeEmoji} {pet.petTypeName}
                      </p>
                      <p className="text-xs">
                        {pet.stageEmoji} {pet.stageName} | Pet #{pet.id}
                      </p>
                      <p className="text-xs">Goal #{pet.goalId}</p>
                    </div>
                  </div>
                  
                  {/* Evolution Progress */}
                  <div className="bg-[#6b4b5b] rounded-full h-2 mb-1">
                    <div 
                      className="bg-[#eeff82] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pet.evolutionProgress.progress}%` }}
                    />
                  </div>
                  <p className="text-xs">
                    Evolution: {pet.evolutionProgress.progress.toFixed(1)}%
                    {pet.evolutionProgress.next && (
                      <span className="text-[#eeff82]">
                        {" "}→ {pet.evolutionProgress.next}
                      </span>
                    )}
                  </p>
                  
                  <p className="text-xs mt-1">
                    Milestones: {pet.milestonesCompleted}/4 | XP: {pet.experienceFormatted}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingDashboard && userGoals.length === 0 && userPets.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full h-32 text-center">
            <p className="text-[#eeff82] mb-2">No pets or goals yet!</p>
            <p className="text-sm">Create your first goal to get started.</p>
            <p className="text-xs mt-1">Your first goal will be ID #{nextGoalId}</p>
          </div>
        )}

        {/* Selected Goal Details */}
        {/* {selectedGoal && (
          <div className="bg-[#6b4b5b] p-3 rounded w-full border-2 border-[#eeff82]">
            <h3 className="text-[18px] mb-2">Selected Goal Details:</h3>
            <p className="font-semibold">{selectedGoal.title}</p>
            <p className="text-sm">Pet: {selectedGoal.petName}</p>
            <p className="text-sm">Status: {selectedGoal.statusText}</p>
            <p className="text-sm">Progress: {selectedGoal.progressPercentage}%</p>
            <p className="text-sm">Stake: {selectedGoal.stakeAmountFormatted} PAT</p>
            <p className="text-sm">Goal ID: #{selectedGoal.id}</p>
            <p className="text-sm">
              {selectedGoal.isExpired ? "Expired" : `${selectedGoal.daysRemaining} days remaining`}
            </p>
            <p className="text-xs mt-1">
              Created: {selectedGoal.createdDate.toLocaleDateString()}
            </p>
          </div>
        )} */}

        <button
          className="absolute bottom-5 right-5 bg-[#6b4b5b] px-5 py-2 disabled:opacity-50"
          onClick={() => handler("MINT")}
          disabled={transactionState.isProcessing}
        >
          MINT NEW
        </button>
      </div>
    );
  }

  if (tab === "VERIFICATION") {
    return (
      <div className="flex flex-col p-3 w-full h-full overflow-y-auto">
        <h1 className="text-[24px] mb-4">MILESTONE VALIDATION</h1>
        
        {/* Loading State */}
        {isLoadingValidations && (
          <div className="flex items-center justify-center w-full h-32">
            <p className="text-[#eeff82]">Loading validation requests...</p>
          </div>
        )}

        {/* Validation Requests */}
        {validationRequests.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-[#eeff82]">
              {validationRequests.length} pending validation{validationRequests.length !== 1 ? 's' : ''}
            </p>
            
            {validationRequests.map((request) => (
              <div key={request.id} className="bg-[#6b4b5b] p-4 rounded">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">Milestone #{request.id}</h3>
                    <p className="text-sm text-[#eeff82]">
                      Goal ID: #{request.goalId}
                    </p>
                    <p className="text-sm">
                      Submitter: {request.submitter.slice(0, 6)}...{request.submitter.slice(-4)}
                    </p>
                    <p className="text-sm">
                      Goal Stake: {parseFloat(request.goalStakeAmount).toFixed(2)} PAT
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm">
                      Status: <span className="text-[#eeff82]">{request.status}</span>
                    </p>
                    <p className="text-xs">
                      Votes: {request.currentApprovals}✅ / {request.currentRejections}❌
                    </p>
                    <p className="text-xs">
                      Required: {request.requiredValidators} validators
                    </p>
                  </div>
                </div>

                {/* Evidence Display */}
                {request.evidenceIPFS && (
                  <div className="bg-[#92848b] p-2 rounded mb-3">
                    <p className="text-sm font-semibold">Evidence:</p>
                    <p className="text-xs break-all">
                      IPFS: {request.evidenceIPFS}
                    </p>
                    <a 
                      href={`https://gateway.pinata.cloud/ipfs/${request.evidenceIPFS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#eeff82] text-xs underline"
                    >
                      View Evidence →
                    </a>
                  </div>
                )}

                {/* Deadline and Actions */}
                <div className="flex justify-between items-center">
                  <p className="text-xs">
                    Deadline: {new Date(parseInt(request.deadline) * 1000).toLocaleString()}
                  </p>
                  
                  {/* Quick Action Buttons (for admin) */}
                  <div className="flex gap-2">
                    <button 
                      className="bg-green-600 px-3 py-1 text-xs rounded hover:bg-green-700"
                      onClick={() => {
                        // TODO: Implement approve functionality
                        alert(`Approve milestone ${request.id} - connect to validation contract`);
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="bg-red-600 px-3 py-1 text-xs rounded hover:bg-red-700"
                      onClick={() => {
                        // TODO: Implement reject functionality
                        alert(`Reject milestone ${request.id} - connect to validation contract`);
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoadingValidations && (
            <div className="flex flex-col items-center justify-center w-full h-32 text-center">
              <p className="text-[#eeff82] mb-2">No pending validations!</p>
              <p className="text-sm">All milestones are up to date.</p>
            </div>
          )
        )}

        {/* Validation System Info */}
        <div className="mt-6 bg-[#6b4b5b] p-3 rounded">
          <h3 className="text-[16px] mb-2">Validation System</h3>
          <ul className="text-sm space-y-1">
            <li>• Milestones require community validation</li>
            <li>• 3-7 validators assigned based on stake amount</li>
            <li>• 72-hour review period per milestone</li>
            <li>• Majority vote determines approval</li>
            <li>• Validators earn rewards for accurate decisions</li>
          </ul>
          
          {/* System Stats */}
          <div className="mt-3 pt-3 border-t border-[#92848b]">
            <p className="text-xs text-[#eeff82]">
              Current pending validations: {validationRequests.length}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "MINT") {
    return (
      <div className="flex flex-col items-center justify-center p-3 w-full h-full relative">
        <h1 className="text-[24px] mb-4">MINT TEST PAT</h1>
        
        {/* Transaction Status Display */}
        {transactionState.isProcessing && (
          <div className="bg-[#6b4b5b] p-4 rounded mb-4 w-full max-w-md">
            <h3 className="text-[18px] mb-2">Transaction Status:</h3>
            <p className="text-[#eeff82]">{transactionState.statusMessage}</p>
            <p>Step: {transactionState.currentStep}</p>
            
            {transactionState.txHash && (
              <p className="mt-2 text-sm break-all">
                Tx Hash: {transactionState.txHash}
              </p>
            )}
          </div>
        )}

        {/* Error Display */}
        {transactionState.error && (
          <div className="bg-red-600 p-4 rounded mb-4 w-full max-w-md">
            <h3 className="text-[18px] mb-2">Error:</h3>
            <p className="text-sm">{transactionState.error}</p>
          </div>
        )}

        {/* Success Display */}
        {transactionState.isCompleted && (
          <div className="bg-green-600 p-4 rounded mb-4 w-full max-w-md">
            <h3 className="text-[18px] mb-2">Success!</h3>
            <p>Goal #{nextGoalId} created successfully!</p>
            <p className="text-sm">Your pet will appear in the PAT LIST shortly.</p>
            <button
              className="mt-2 bg-[#6b4b5b] px-3 py-1 rounded"
              onClick={handleReset}
            >
              View Goals
            </button>
          </div>
        )}

        {/* Test Goal Info */}
        <div className="bg-[#6b4b5b] p-4 rounded mb-4 w-full max-w-md">
          <h3 className="text-[18px] mb-2">Test Goal Details:</h3>
          <ul className="text-sm space-y-1">
            <li>🎯 Goal: Complete Fitness Challenge #{nextGoalId}</li>
            <li>💰 Stake: 50 PAT tokens</li>
            <li>⏱️ Duration: 30 days</li>
            <li>🐱 Pet: FitBuddy{nextGoalId} (Cat)</li>
            <li>📋 Milestones: 4 total</li>
            <li>🆔 Goal ID: #{nextGoalId}</li>
          </ul>
        </div>

        <div className="absolute bottom-5 right-5 flex gap-3">
          <button
            className="bg-[#92848b] px-5 py-2"
            onClick={() => handler("PAT_LIST")}
            disabled={transactionState.isProcessing}
          >
            BACK
          </button>
          <button
            className="bg-[#6b4b5b] px-5 py-2 disabled:opacity-50"
            onClick={mintPet}
            disabled={transactionState.isProcessing || isCreatingGoal}
          >
            {isCreatingGoal || transactionState.isProcessing 
              ? "CREATING..." 
              : "MINT PAT TESTING"
            }
          </button>
        </div>
      </div>
    );
  }

  return null;
}