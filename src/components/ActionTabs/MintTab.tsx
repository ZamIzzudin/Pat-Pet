import React, { useState } from "react";
import { PetType, useGoal } from "@/app/hooks/contexts/GoalHookContext";
import { PetMetadataHelper } from "@/lib/metaDataHelper";

interface MintTabProps {
  handler: (tab: string) => void;
}

export function MintTab({ handler }: MintTabProps) {
  const {
    createGoalWithMilestones,
    transactionState,
    resetTransaction,
    nextGoalId,
  } = useGoal();

  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

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

  return (
    <div className="flex flex-col items-center justify-center p-3 w-full h-full relative">
      <h1 className="text-[24px] mb-4 flex items-center gap-2">
        ✨ MINT TEST PAT
      </h1>
      
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
          className="bg-[#92848b] px-5 py-2 hover:bg-[#7a7082] transition-colors"
          onClick={() => handler("PAT_LIST")}
          disabled={transactionState.isProcessing}
        >
          BACK
        </button>
        <button
          className="bg-[#6b4b5b] px-5 py-2 disabled:opacity-50 hover:bg-[#5a3f4a] transition-colors"
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