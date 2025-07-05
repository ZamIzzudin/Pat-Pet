/** @format */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { EventBus, GAME_EVENTS } from "@/lib/eventBus";
import { useWeb3 } from "./Web3Provider";
import { PetType, useGoal } from "@/app/hooks/contexts/GoalHookContext";
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
        className="bg-[#c49a6c] text-white w-[60dvw] h-[70dvh] flex items-center justify-center relative border-[10px] border-[#6b4b5b]"
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
  data,
}: {
  tab: string;
  handler: (tab: string) => void;
  data: any[];
}) {
  const { 
    createGoalWithMilestones, 
    transactionState, 
    goalInfo, 
    petInfo,
    resetTransaction 
  } = useGoal();

  useEffect(() => {
    console.log(petInfo ,"PET INFO")
  }, [petInfo])
  

  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  const mintPet = async () => {
    try {
      setIsCreatingGoal(true);
      console.log('🚀 Starting test goal creation...');

      // Hardcoded test goal data
      const testGoalData = {
        title: "Complete Fitness Challenge",
        stakeAmount: "50", // 50 PAT tokens
        durationDays: 30,
        petName: "TestBuddy",
        petType: PetType.CAT, // Using CAT since it has real IPFS URLs
        petMetadataIPFS: "", // Will be generated
        milestoneDescriptions: [
          "Complete Week 1: Basic exercises daily",
          "Complete Week 2: Increase workout intensity", 
          "Complete Week 3: Add cardio routine",
          "Complete Week 4: Final fitness assessment"
        ]
      };

      // Step 1: Generate pet metadata
      console.log('📝 Generating pet metadata...');
      const initialMetadata = PetMetadataHelper.generateInitialPetMetadata(
        testGoalData.petName,
        testGoalData.petType,
        1, // Will be replaced with actual goalId after creation
        testGoalData.milestoneDescriptions.length,
        testGoalData.title
      );

      console.log('Generated metadata:', initialMetadata);


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

  if (tab === "PAT_LIST") {
    return (
      <div className="flex p-3 w-full h-full relative flex-col items-center justify-start gap-3">
        <h1 className="text-[24px]">PAT LIST</h1>
        
        {/* Display current goal/pet info if available */}
        {goalInfo && (
          <div className="bg-[#6b4b5b] p-3 rounded w-full">
            <h3 className="text-[18px] mb-2">Latest Goal Created:</h3>
            <p>Goal ID: {goalInfo.goalId}</p>
            <p>Status: {goalInfo.statusText}</p>
            <p>Progress: {goalInfo.milestonesCompleted}/{goalInfo.totalMilestones} milestones</p>
            <p>Stake: {goalInfo.stakeAmount} PAT</p>
          </div>
        )}

        {/* Display pet info if available */}
        {petInfo && (
          <div className="bg-[#6b4b5b] p-3 rounded w-full">
            <h3 className="text-[18px] mb-2">Pet Created:</h3>
            <p>Name: {petInfo.petTypeName}</p>
            <p>Stage: {petInfo.stageName}</p>
            <p>Level: {petInfo.level}</p>
            <p>Experience: {petInfo.experience}</p>
            <p>Milestones: {petInfo.milestonesCompleted}/{4}</p>
            
            {/* Display pet image */}
            <div className="mt-2">
              <Image
                src={PetMetadataHelper.getPetImageUrl(petInfo.petType, petInfo.stage)}
                alt={petInfo.petTypeName}
                width={100}
                height={100}
                className="rounded"
              />
            </div>
          </div>
        )}

        {/* <div className="flex gap-3 w-full cursor-pointer">
          {data.map((pet: any, index: number) => (
            <div key={index} className="bg-[#6b4b5b] p-3">
              <Image
                src={pet.stage === "egg" ? pet.egg_url : pet.adult_url}
                alt={pet.name}
                width={100}
                height={100}
              />
              <div className="flex gap-1">
                <span>{pet.name}</span>
                <span className="text-[#eeff82]">({pet.stage})</span>
              </div>
            </div>
          ))}
        </div> */}

        <button
          className="absolute bottom-5 right-5 bg-[#6b4b5b] px-5 py-2 disabled:opacity-50"
          onClick={() => handler("MINT")}
          disabled={transactionState.isProcessing}
        >
          MINT
        </button>
      </div>
    );
  }

  if (tab === "VERIFICATION") {
    return (
      <div className="flex flex-col items-center justify-center p-3">
        <h1 className="text-[24px] mb-4">VERIFICATION</h1>
        <p>Validation system coming soon...</p>
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
            <p>Goal created successfully!</p>
            <button
              className="mt-2 bg-[#6b4b5b] px-3 py-1 rounded"
              onClick={handleReset}
            >
              View Goal
            </button>
          </div>
        )}

        {/* Test Goal Info */}
        <div className="bg-[#6b4b5b] p-4 rounded mb-4 w-full max-w-md">
          <h3 className="text-[18px] mb-2">Test Goal Details:</h3>
          <ul className="text-sm space-y-1">
            <li>🎯 Goal: Complete Fitness Challenge</li>
            <li>💰 Stake: 50 PAT tokens</li>
            <li>⏱️ Duration: 30 days</li>
            <li>🐱 Pet: TestBuddy (Cat)</li>
            <li>📋 Milestones: 4 total</li>
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