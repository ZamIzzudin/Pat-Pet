import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useGoal, FormattedGoalInfo } from "@/app/hooks/contexts/GoalHookContext";

interface PetListTabProps {
  handler: (tab: string) => void;
}

export function PatListTab({ handler }: PetListTabProps) {
  const {
    userGoals,
    userPets,
    userStats,
    isLoadingDashboard,
    transactionState,
    setCurrentGoalId,
    nextGoalId,
  } = useGoal();

  const [selectedGoal, setSelectedGoal] = useState<FormattedGoalInfo | null>(null);

  const handleGoalSelect = (goal: FormattedGoalInfo) => {
    setSelectedGoal(goal);
    setCurrentGoalId(goal.id);
    console.log("Selected goal:", goal);
  };

  return (
    <div className="flex p-3 w-full h-full relative flex-col items-start justify-start gap-3 overflow-y-auto">
      <h1 className="text-[24px] flex items-center gap-2">
        🐾 PAT LIST
      </h1>

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
                  selectedGoal?.id === goal.id ? "ring-2 ring-[#eeff82]" : ""
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
                      e.currentTarget.src = "/placeholder-pet.png";
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

      <button
        className="absolute bottom-5 right-5 bg-[#6b4b5b] px-5 py-2 disabled:opacity-50 hover:bg-[#5a3f4a] transition-colors"
        onClick={() => handler("MINT")}
        disabled={transactionState.isProcessing}
      >
        MINT NEW
      </button>
    </div>
  );
}