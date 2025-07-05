// // components/modals/ActionModal.tsx
// "use client";

// // components/modals/tabs/ValidatorSetupTab.tsx
// import React, { useState } from "react";
// import { useGoal } from "@/app/hooks/contexts/GoalHookContext";
// import { useAccount, useReadContract, useWriteContract } from "wagmi";
// import { formatEther, parseEther } from "viem";
// import { PAT_VALIDATION_SYSTEM_ABI, PAT_VALIDATION_SYSTEM_ADDRESS } from "@/app/contracts/PatValidationSystem";
// import { PATTOKEN_ADDRESS } from "@/app/contracts/PATToken";

// interface ValidatorSetupTabProps {
//   handler: (tab: string) => void;
// }

// export function ValidatorSetupTab({ handler }: ValidatorSetupTabProps) {
//   const { address: userAddress } = useAccount();
//   const { transactionState } = useGoal();
//   const [stakeAmount, setStakeAmount] = useState("50"); // Minimum 50 PAT
//   const [isRegistering, setIsRegistering] = useState(false);

//   // Read validator info
//   const { data: validatorInfo } = useReadContract({
//     address: PAT_VALIDATION_SYSTEM_ADDRESS,
//     abi: PAT_VALIDATION_SYSTEM_ABI,
//     functionName: 'validators',
//     args: userAddress ? [userAddress] : undefined,
//     query: {
//       enabled: !!userAddress,
//     }
//   });

//   // Read system stats
//   const { data: systemStats } = useReadContract({
//     address: PAT_VALIDATION_SYSTEM_ADDRESS,
//     abi: PAT_VALIDATION_SYSTEM_ABI,
//     functionName: 'getSystemStats',
//     query: {
//       enabled: true,
//     }
//   });

//   // Write contract for registration
//   const { writeContract } = useWriteContract();

//   const isValidator = validatorInfo && validatorInfo[0] > 0; // stakedAmount > 0
//   const validatorData = validatorInfo ? {
//     stakedAmount: formatEther(validatorInfo[0]),
//     reputationScore: Number(validatorInfo[1]),
//     totalValidations: Number(validatorInfo[2]),
//     isActive: validatorInfo[3],
//   } : null;

//   const systemData = systemStats ? {
//     totalValidators: Number(systemStats[0]),
//     activeValidators: Number(systemStats[1]),
//     totalValidations: Number(systemStats[2]),
//   } : null;

//   const handleRegisterValidator = async () => {
//     if (!userAddress) {
//       alert("Please connect your wallet");
//       return;
//     }

//     const stakeAmountParsed = parseFloat(stakeAmount);
//     if (stakeAmountParsed < 50) {
//       alert("Minimum stake amount is 50 PAT");
//       return;
//     }

//     try {
//       setIsRegistering(true);
      
//       console.log('🚀 Registering as validator...', {
//         stakeAmount: stakeAmount,
//         userAddress: userAddress,
//       });

//       // Note: This will trigger the approval + registration flow via useTransactions
//       await writeContract({
//         address: PAT_VALIDATION_SYSTEM_ADDRESS,
//         abi: PAT_VALIDATION_SYSTEM_ABI,
//         functionName: 'registerValidator',
//         args: [parseEther(stakeAmount)],
//       });

//     } catch (error) {
//       console.error('❌ Failed to register validator:', error);
//       alert(`Failed to register: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsRegistering(false);
//     }
//   };

//   return (
//     <div className="flex flex-col p-3 w-full h-full overflow-y-auto">
//       <h1 className="text-[24px] mb-4 flex items-center gap-2">
//         ⚖️ VALIDATOR SETUP
//       </h1>

//       {/* System Status */}
//       {systemData && (
//         <div className="bg-[#6b4b5b] p-4 rounded mb-4">
//           <h3 className="text-[18px] mb-2">System Status:</h3>
//           <div className="grid grid-cols-3 gap-3 text-sm">
//             <div className="bg-[#92848b] p-2 rounded text-center">
//               <p className="font-semibold">{systemData.totalValidators}</p>
//               <p className="text-xs text-[#eeff82]">Total Validators</p>
//             </div>
//             <div className="bg-[#92848b] p-2 rounded text-center">
//               <p className="font-semibold">{systemData.activeValidators}</p>
//               <p className="text-xs text-[#eeff82]">Active Validators</p>
//             </div>
//             <div className="bg-[#92848b] p-2 rounded text-center">
//               <p className="font-semibold">{systemData.totalValidations}</p>
//               <p className="text-xs text-[#eeff82]">Total Validations</p>
//             </div>
//           </div>
          
//           {systemData.activeValidators < 3 && (
//             <div className="mt-3 p-2 bg-red-600 rounded">
//               <p className="text-sm font-semibold">⚠️ Insufficient Validators!</p>
//               <p className="text-xs">Need at least 3 active validators for milestone submissions.</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Your Validator Status */}
//       {userAddress && (
//         <div className="bg-[#6b4b5b] p-4 rounded mb-4">
//           <h3 className="text-[18px] mb-2">Your Validator Status:</h3>
          
//           {isValidator && validatorData ? (
//             <div className="space-y-2">
//               <div className="bg-green-600 p-3 rounded">
//                 <p className="font-semibold">✅ You are a registered validator!</p>
//               </div>
              
//               <div className="grid grid-cols-2 gap-3 text-sm">
//                 <div className="bg-[#92848b] p-2 rounded">
//                   <p className="font-semibold">{validatorData.stakedAmount} PAT</p>
//                   <p className="text-xs text-[#eeff82]">Staked Amount</p>
//                 </div>
//                 <div className="bg-[#92848b] p-2 rounded">
//                   <p className="font-semibold">{validatorData.reputationScore}</p>
//                   <p className="text-xs text-[#eeff82]">Reputation Score</p>
//                 </div>
//                 <div className="bg-[#92848b] p-2 rounded">
//                   <p className="font-semibold">{validatorData.totalValidations}</p>
//                   <p className="text-xs text-[#eeff82]">Total Validations</p>
//                 </div>
//                 <div className="bg-[#92848b] p-2 rounded">
//                   <p className="font-semibold">{validatorData.isActive ? "Active" : "Inactive"}</p>
//                   <p className="text-xs text-[#eeff82]">Status</p>
//                 </div>
//               </div>
              
//               {!validatorData.isActive && (
//                 <div className="bg-yellow-600 p-2 rounded">
//                   <p className="text-sm">⚠️ Your validator is inactive (reputation < 500)</p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="space-y-3">
//               <div className="bg-yellow-600 p-3 rounded">
//                 <p className="font-semibold">⚠️ You are not registered as a validator</p>
//                 <p className="text-xs">Register to help validate milestones and earn rewards!</p>
//               </div>
              
//               {/* Registration Form */}
//               <div className="space-y-3">
//                 <label className="block">
//                   <span className="text-sm font-medium mb-2 block">Stake Amount (PAT):</span>
//                   <input
//                     type="number"
//                     min="50"
//                     step="1"
//                     value={stakeAmount}
//                     onChange={(e) => setStakeAmount(e.target.value)}
//                     className="w-full p-2 rounded bg-[#92848b] text-white placeholder-gray-300"
//                     placeholder="Minimum 50 PAT"
//                     disabled={isRegistering || transactionState.isProcessing}
//                   />
//                   <p className="text-xs text-[#eeff82] mt-1">
//                     Minimum: 50 PAT | Higher stake = more validation assignments
//                   </p>
//                 </label>
                
//                 <button
//                   className="w-full bg-green-600 px-4 py-3 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
//                   onClick={handleRegisterValidator}
//                   disabled={isRegistering || transactionState.isProcessing || parseFloat(stakeAmount) < 50}
//                 >
//                   {isRegistering || transactionState.isProcessing ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <span className="animate-spin">⏳</span>
//                       Registering...
//                     </span>
//                   ) : (
//                     `⚖️ Register as Validator (${stakeAmount} PAT)`
//                   )}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Transaction Status */}
//       {transactionState.isProcessing && (
//         <div className="bg-[#6b4b5b] p-4 rounded mb-4">
//           <h3 className="text-[18px] mb-2">Transaction Status:</h3>
//           <p className="text-[#eeff82]">{transactionState.statusMessage}</p>
//           <p className="text-sm">Step: {transactionState.currentStep}</p>
//         </div>
//       )}

//       {/* Success State */}
//       {transactionState.isCompleted && (
//         <div className="bg-green-600 p-4 rounded mb-4">
//           <h3 className="text-[18px] mb-2">Registration Successful! 🎉</h3>
//           <p className="text-sm">You are now registered as a validator!</p>
//           <p className="text-xs mt-1">You'll start receiving validation assignments soon.</p>
//         </div>
//       )}

//       {/* Error State */}
//       {transactionState.error && (
//         <div className="bg-red-600 p-4 rounded mb-4">
//           <h3 className="text-[18px] mb-2">Registration Failed</h3>
//           <p className="text-sm">{transactionState.error}</p>
//         </div>
//       )}

//       {/* Validator Information */}
//       <div className="bg-[#6b4b5b] p-4 rounded">
//         <h3 className="text-[16px] mb-2">Validator System:</h3>
//         <ul className="text-sm space-y-1">
//           <li>• Minimum stake: 50 PAT tokens</li>
//           <li>• Starting reputation: 1000 points</li>
//           <li>• Earn 5 PAT + bonuses per validation</li>
//           <li>• +10 reputation for accurate votes</li>
//           <li>• -10 reputation for inaccurate votes</li>
//           <li>• Deactivated if reputation < 500</li>
//           <li>• 72-hour review period per milestone</li>
//         </ul>
        
//         <div className="mt-3 pt-3 border-t border-[#92848b]">
//           <p className="text-sm font-semibold mb-1">Validation Process:</p>
//           <div className="text-xs text-[#eeff82] space-y-1">
//             <p>1. System assigns you to review milestone evidence</p>
//             <p>2. You have 72 hours to vote Approve/Reject</p>
//             <p>3. Majority decision determines outcome</p>
//             <p>4. Earn rewards for participating and accuracy</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// } from "react";
// import { EventBus, GAME_EVENTS } from "@/lib/eventBus";
// import { useWeb3 } from "./Web3Provider";
// import { PetListTab } from "./tabs/PetListTab";
// import { ValidationTab } from "./tabs/ValidationTab";
// import { MintTab } from "./tabs/MintTab";
// import { MyMilestonesTab } from "./tabs/MyMilestonesTab";
// import { ValidatorSetupTab } from "./tabs/ValidatorSetupTab";

// export default function ActionModal({
//   show,
//   setShow,
// }: {
//   show: boolean;
//   setShow: any;
// }) {
//   const { pets } = useWeb3();
//   const [activeTab, setActiveTab] = useState("PAT_LIST");
//   const [eventBus] = useState(() => EventBus.getInstance());

//   return (
//     <div
//       className={`top-0 left-0 right-0 bottom-0 items-center justify-center bg-[#00000070] ${
//         show ? "flex absolute z-[1000]" : " hidden"
//       }`}
//       onClick={(e) => {
//         setShow();
//         eventBus.emit(GAME_EVENTS.MODAL_HIDE);
//       }}
//     >
//       <div
//         onClick={(e) => {
//           e.stopPropagation();
//         }}
//         className="bg-[#c49a6c] text-white w-[80dvw] h-[80dvh] flex items-center justify-center relative border-[10px] border-[#6b4b5b]"
//       >
//         <button
//           className="absolute top-0 right-0 w-[50px] aspect-square text-[24px] cursor-pointer z-100"
//           onClick={() => {
//             setShow();
//             eventBus.emit(GAME_EVENTS.MODAL_HIDE);
//           }}
//         >
//           x
//         </button>
//         <div className="flex w-full h-full">
//           <TabSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
//           <div className="flex-grow flex items-center justify-center">
//             <TabRenderer
//               tab={activeTab}
//               handler={(tab: string) => setActiveTab(tab)}
//               data={pets}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Sidebar Component
// function TabSidebar({ 
//   activeTab, 
//   setActiveTab 
// }: { 
//   activeTab: string; 
//   setActiveTab: (tab: string) => void; 
// }) {
//   const tabs = [
//     { id: "PAT_LIST", label: "PAT LIST", icon: "🐾" },
//     { id: "MY_MILESTONES", label: "MY MILESTONES", icon: "🎯" },
//     { id: "VALIDATION", label: "VALIDATION", icon: "✅" },
//     { id: "VALIDATOR_SETUP", label: "VALIDATOR SETUP", icon: "⚖️" },
//     { id: "MINT", label: "MINT NEW", icon: "✨" },
//   ];

//   return (
//     <aside className="w-[20%] p-3 border-r-[5px] border-[#6b4b5b]">
//       <ul className="flex flex-col gap-3">
//         {tabs.map((tab) => (
//           <li
//             key={tab.id}
//             className={`${
//               activeTab === tab.id ? "bg-[#6b4b5b]" : "bg-[#92848b]"
//             } p-3 cursor-pointer duration-300 hover:bg-[#6b4b5b] rounded transition-all`}
//             onClick={() => setActiveTab(tab.id)}
//           >
//             <div className="flex items-center gap-2">
//               <span className="text-lg">{tab.icon}</span>
//               <span className="text-sm font-medium">{tab.label}</span>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </aside>
//   );
// }

// // Main Tab Renderer
// function TabRenderer({
//   tab,
//   handler,
//   data,
// }: {
//   tab: string;
//   handler: (tab: string) => void;
//   data: any[];
// }) {
//   switch (tab) {
//     case "PAT_LIST":
//       return <PetListTab handler={handler} />;
//     case "MY_MILESTONES":
//       return <MyMilestonesTab handler={handler} />;
//     case "VALIDATION":
//       return <ValidationTab handler={handler} />;
//     case "VALIDATOR_SETUP":
//       return <ValidatorSetupTab handler={handler} />;
//     case "MINT":
//       return <MintTab handler={handler} />;
//     default:
//       return <PetListTab handler={handler} />;
//   }
// }

// // components/modals/tabs/PetListTab.tsx
// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { useGoal, FormattedGoalInfo } from "@/app/hooks/contexts/GoalHookContext";

// interface PetListTabProps {
//   handler: (tab: string) => void;
// }

// export function PetListTab({ handler }: PetListTabProps) {
//   const {
//     userGoals,
//     userPets,
//     userStats,
//     isLoadingDashboard,
//     transactionState,
//     setCurrentGoalId,
//     nextGoalId,
//   } = useGoal();

//   const [selectedGoal, setSelectedGoal] = useState<FormattedGoalInfo | null>(null);

//   const handleGoalSelect = (goal: FormattedGoalInfo) => {
//     setSelectedGoal(goal);
//     setCurrentGoalId(goal.id);
//     console.log("Selected goal:", goal);
//   };

//   return (
//     <div className="flex p-3 w-full h-full relative flex-col items-start justify-start gap-3 overflow-y-auto">
//       <h1 className="text-[24px] flex items-center gap-2">
//         🐾 PAT LIST
//       </h1>

//       {/* Loading State */}
//       {isLoadingDashboard && (
//         <div className="flex items-center justify-center w-full h-32">
//           <p className="text-[#eeff82]">Loading your pets and goals...</p>
//         </div>
//       )}

//       {/* User Stats */}
//       {userStats && (
//         <div className="bg-[#6b4b5b] p-3 rounded w-full">
//           <h3 className="text-[18px] mb-2">Your Stats:</h3>
//           <div className="grid grid-cols-2 gap-2 text-sm">
//             <p>Total Goals: {userStats.totalGoals}</p>
//             <p>Completed: {userStats.completedGoals}</p>
//             <p>Active Goals: {userStats.activeGoals}</p>
//             <p>Rewards: {parseFloat(userStats.totalRewardsEarned).toFixed(2)} PAT</p>
//           </div>
//           <p className="text-xs text-[#eeff82] mt-1">
//             Next Goal ID: #{nextGoalId}
//           </p>
//         </div>
//       )}

//       {/* Goals List */}
//       {userGoals.length > 0 && (
//         <div className="bg-[#6b4b5b] p-3 rounded w-full">
//           <h3 className="text-[18px] mb-2">Your Goals ({userGoals.length}):</h3>
//           <div className="space-y-2 max-h-40 overflow-y-auto">
//             {userGoals.map((goal) => (
//               <div
//                 key={goal.id}
//                 className={`bg-[#92848b] p-2 rounded cursor-pointer hover:bg-[#7a7082] transition-colors ${
//                   selectedGoal?.id === goal.id ? "ring-2 ring-[#eeff82]" : ""
//                 }`}
//                 onClick={() => handleGoalSelect(goal)}
//               >
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="font-semibold">{goal.title}</p>
//                     <p className="text-sm text-[#eeff82]">
//                       Progress: {goal.milestonesCompleted}/{goal.totalMilestones} milestones
//                     </p>
//                     <p className="text-xs">
//                       Status: {goal.statusText} | Stake: {goal.stakeAmountFormatted} PAT
//                     </p>
//                     <p className="text-xs">Goal ID: #{goal.id}</p>
//                   </div>
//                   <div className="text-right">
//                     <div className="w-12 h-12 bg-[#6b4b5b] rounded flex items-center justify-center">
//                       <span className="text-xs">{goal.progressPercentage}%</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Pets Collection */}
//       {userPets.length > 0 && (
//         <div className="bg-[#6b4b5b] p-3 rounded w-full">
//           <h3 className="text-[18px] mb-2">Your Pet Collection ({userPets.length}):</h3>
//           <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
//             {userPets.map((pet) => (
//               <div key={pet.id} className="bg-[#92848b] p-3 rounded">
//                 <div className="flex items-center gap-2 mb-2">
//                   <Image
//                     src={pet.imageUrl}
//                     alt={pet.name}
//                     width={60}
//                     height={60}
//                     className="rounded"
//                     onError={(e) => {
//                       e.currentTarget.src = "/placeholder-pet.png";
//                     }}
//                   />
//                   <div>
//                     <p className="font-semibold">{pet.name}</p>
//                     <p className="text-sm text-[#eeff82]">
//                       {pet.petTypeEmoji} {pet.petTypeName}
//                     </p>
//                     <p className="text-xs">
//                       {pet.stageEmoji} {pet.stageName} | Pet #{pet.id}
//                     </p>
//                     <p className="text-xs">Goal #{pet.goalId}</p>
//                   </div>
//                 </div>

//                 {/* Evolution Progress */}
//                 <div className="bg-[#6b4b5b] rounded-full h-2 mb-1">
//                   <div
//                     className="bg-[#eeff82] h-2 rounded-full transition-all duration-300"
//                     style={{ width: `${pet.evolutionProgress.progress}%` }}
//                   />
//                 </div>
//                 <p className="text-xs">
//                   Evolution: {pet.evolutionProgress.progress.toFixed(1)}%
//                   {pet.evolutionProgress.next && (
//                     <span className="text-[#eeff82]">
//                       {" "}→ {pet.evolutionProgress.next}
//                     </span>
//                   )}
//                 </p>

//                 <p className="text-xs mt-1">
//                   Milestones: {pet.milestonesCompleted}/4 | XP: {pet.experienceFormatted}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Empty State */}
//       {!isLoadingDashboard && userGoals.length === 0 && userPets.length === 0 && (
//         <div className="flex flex-col items-center justify-center w-full h-32 text-center">
//           <p className="text-[#eeff82] mb-2">No pets or goals yet!</p>
//           <p className="text-sm">Create your first goal to get started.</p>
//           <p className="text-xs mt-1">Your first goal will be ID #{nextGoalId}</p>
//         </div>
//       )}

//       <button
//         className="absolute bottom-5 right-5 bg-[#6b4b5b] px-5 py-2 disabled:opacity-50 hover:bg-[#5a3f4a] transition-colors"
//         onClick={() => handler("MINT")}
//         disabled={transactionState.isProcessing}
//       >
//         MINT NEW
//       </button>
//     </div>
//   );
// }

// // components/modals/tabs/MyMilestonesTab.tsx
// import React, { useState, useEffect } from "react";
// import { useGoal, FormattedGoalInfo } from "@/app/hooks/contexts/GoalHookContext";
// import { useEnhancedMilestoneSubmission } from "@/hooks/useEnhancedMilestoneSubmission";
// import { FileUploadZone } from "@/components/common/FileUploadZone";
// import { PinataEvidenceUploader } from "@/lib/pinataUploader";

// interface MyMilestonesTabProps {
//   handler: (tab: string) => void;
// }

// interface MilestoneWithGoal {
//   id: string;
//   goalId: string;
//   description: string;
//   isCompleted: boolean;
//   evidenceIPFS?: string;
//   createdAt: string;
//   goal?: FormattedGoalInfo;
// }

// export function MyMilestonesTab({ handler }: MyMilestonesTabProps) {
//   const {
//     userGoals,
//     currentMilestones,
//     transactionState,
//     isLoadingDashboard,
//     setCurrentGoalId,
//   } = useGoal();

//   const {
//     submitMilestoneWithEvidence,
//     submissionProgress,
//     resetSubmission,
//     isSubmitting,
//     isCompleted,
//     hasError,
//   } = useEnhancedMilestoneSubmission();

//   const [selectedMilestone, setSelectedMilestone] = useState<MilestoneWithGoal | null>(null);
//   const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
//   const [uploadPreview, setUploadPreview] = useState<string | null>(null);

//   // Get all milestones from user's active goals
//   const allMilestones: MilestoneWithGoal[] = userGoals.flatMap((goal) => {
//     // For demo purposes, create mock milestones since we don't have them from GraphQL yet
//     const milestones: MilestoneWithGoal[] = [];
    
//     // Generate milestones based on goal's total milestones
//     for (let i = 0; i < goal.totalMilestones; i++) {
//       milestones.push({
//         id: `${goal.id}_${i}`,
//         goalId: goal.id,
//         description: `Milestone ${i + 1} for ${goal.title}`,
//         isCompleted: i < goal.milestonesCompleted,
//         createdAt: goal.createdAt,
//         goal: goal,
//       });
//     }
    
//     return milestones;
//   });

//   // Filter for incomplete milestones only
//   const incompleteMilestones = allMilestones.filter(m => !m.isCompleted);

//   const handleFileSelect = (file: File) => {
//     setEvidenceFile(file);
    
//     // Create preview for images
//     if (PinataEvidenceUploader.isImageFile(file.type)) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setUploadPreview(e.target?.result as string);
//       };
//       reader.readAsDataURL(file);
//     } else {
//       setUploadPreview(null);
//     }
//   };

//   const handleSubmitEvidence = async () => {
//     if (!selectedMilestone || !evidenceFile) {
//       alert("Please select a milestone and upload evidence file");
//       return;
//     }

//     try {
//       console.log('🚀 Submitting milestone evidence...', {
//         milestoneId: selectedMilestone.id,
//         fileName: evidenceFile.name,
//         fileSize: evidenceFile.size,
//         fileType: evidenceFile.type,
//       });

//       // Submit milestone with enhanced evidence upload
//       await submitMilestoneWithEvidence({
//         milestoneId: selectedMilestone.id,
//         evidenceFile: evidenceFile,
//       });

//       // Reset form on success (after a delay to show success state)
//       setTimeout(() => {
//         setSelectedMilestone(null);
//         setEvidenceFile(null);
//         setUploadPreview(null);
//         resetSubmission();
//       }, 3000);
      
//     } catch (error) {
//       console.error('❌ Failed to submit milestone:', error);
//     }
//   };

//   const clearSelection = () => {
//     setSelectedMilestone(null);
//     setEvidenceFile(null);
//     setUploadPreview(null);
//     resetSubmission();
//   };

//   return (
//     <div className="flex flex-col p-3 w-full h-full overflow-y-auto">
//       <h1 className="text-[24px] mb-4 flex items-center gap-2">
//         🎯 MY MILESTONES
//       </h1>

//       {/* Loading State */}
//       {isLoadingDashboard && (
//         <div className="flex items-center justify-center w-full h-32">
//           <p className="text-[#eeff82]">Loading your milestones...</p>
//         </div>
//       )}

//       {/* Enhanced Progress Display */}
//       {isSubmitting && (
//         <div className="bg-[#6b4b5b] p-4 rounded mb-4">
//           <h3 className="text-[18px] mb-2">Submitting Evidence:</h3>
//           <p className="text-[#eeff82] mb-2">{submissionProgress.message}</p>
//           <div className="bg-[#92848b] rounded-full h-3 mb-2">
//             <div 
//               className="bg-[#eeff82] h-3 rounded-full transition-all duration-500"
//               style={{ width: `${submissionProgress.progress}%` }}
//             />
//           </div>
//           <p className="text-xs">Progress: {submissionProgress.progress}%</p>
          
//           {submissionProgress.uploadResult && (
//             <div className="mt-3 p-2 bg-[#92848b] rounded">
//               <p className="text-xs font-semibold">IPFS Upload Complete:</p>
//               <p className="text-xs break-all">Hash: {submissionProgress.uploadResult.ipfsHash}</p>
//               <p className="text-xs">Size: {PinataEvidenceUploader.formatFileSize(submissionProgress.uploadResult.fileSize)}</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Success State */}
//       {isCompleted && (
//         <div className="bg-green-600 p-4 rounded mb-4">
//           <h3 className="text-[18px] mb-2">Evidence Submitted! 🎉</h3>
//           <p className="text-sm">Your milestone evidence has been submitted for validation.</p>
//           <p className="text-xs mt-1">Validators will review it within 72 hours.</p>
          
//           {submissionProgress.uploadResult && (
//             <div className="mt-3 p-2 bg-green-700 rounded">
//               <p className="text-xs font-semibold">Evidence Details:</p>
//               <p className="text-xs">File: {submissionProgress.uploadResult.fileName}</p>
//               <p className="text-xs">IPFS: {submissionProgress.uploadResult.ipfsHash}</p>
//               <a 
//                 href={submissionProgress.uploadResult.gatewayUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-[#eeff82] text-xs underline"
//               >
//                 View Evidence →
//               </a>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Error State */}
//       {hasError && (
//         <div className="bg-red-600 p-4 rounded mb-4">
//           <h3 className="text-[18px] mb-2">Submission Failed</h3>
//           <p className="text-sm">{submissionProgress.error}</p>
//           <button
//             className="mt-2 bg-red-700 px-3 py-1 rounded text-sm hover:bg-red-800"
//             onClick={clearSelection}
//           >
//             Try Again
//           </button>
//         </div>
//       )}

//       {/* Milestone Selection */}
//       {incompleteMilestones.length > 0 ? (
//         <div className="space-y-4">
//           <div className="bg-[#6b4b5b] p-4 rounded">
//             <h3 className="text-[18px] mb-3">Select Milestone to Submit Evidence:</h3>
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {incompleteMilestones.map((milestone) => (
//                 <div
//                   key={milestone.id}
//                   className={`bg-[#92848b] p-3 rounded cursor-pointer hover:bg-[#7a7082] transition-colors ${
//                     selectedMilestone?.id === milestone.id ? "ring-2 ring-[#eeff82]" : ""
//                   }`}
//                   onClick={() => {
//                     setSelectedMilestone(milestone);
//                     setCurrentGoalId(milestone.goalId);
//                   }}
//                 >
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <p className="font-semibold text-sm">{milestone.description}</p>
//                       <p className="text-xs text-[#eeff82]">
//                         Goal: {milestone.goal?.title}
//                       </p>
//                       <p className="text-xs">
//                         Goal ID: #{milestone.goalId} | Status: Pending
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-xs bg-[#6b4b5b] px-2 py-1 rounded">
//                         📋 Ready
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Enhanced Evidence Upload Section */}
//           {selectedMilestone && (
//             <div className="bg-[#6b4b5b] p-4 rounded">
//               <h3 className="text-[18px] mb-3">Upload Evidence:</h3>
              
//               {/* Selected Milestone Info */}
//               <div className="bg-[#92848b] p-3 rounded mb-4">
//                 <h4 className="font-semibold flex items-center gap-2">
//                   🎯 Selected Milestone:
//                 </h4>
//                 <p className="text-sm">{selectedMilestone.description}</p>
//                 <p className="text-xs text-[#eeff82]">Goal: {selectedMilestone.goal?.title}</p>
//                 <p className="text-xs">Milestone ID: {selectedMilestone.id}</p>
//               </div>

//               {/* Enhanced File Upload Zone */}
//               <FileUploadZone
//                 onFileSelect={handleFileSelect}
//                 selectedFile={evidenceFile}
//                 preview={uploadPreview}
//                 disabled={isSubmitting}
//               />

//               {/* Action Buttons */}
//               <div className="flex gap-3 pt-4">
//                 <button
//                   className="bg-[#92848b] px-4 py-2 rounded hover:bg-[#7a7082] transition-colors"
//                   onClick={clearSelection}
//                   disabled={isSubmitting}
//                 >
//                   Clear
//                 </button>
//                 <button
//                   className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex-1 flex items-center justify-center gap-2"
//                   onClick={handleSubmitEvidence}
//                   disabled={!evidenceFile || isSubmitting}
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <span className="animate-spin">⏳</span>
//                       {submissionProgress.message}
//                     </>
//                   ) : (
//                     <>
//                       📤 Submit Evidence
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Instructions */}
//           <div className="bg-[#6b4b5b] p-3 rounded">
//             <h3 className="text-[16px] mb-2">Submission Guidelines:</h3>
//             <ul className="text-sm space-y-1">
//               <li>• Upload clear evidence of milestone completion</li>
//               <li>• Supported: Images, videos, PDFs, documents</li>
//               <li>• Max file size: 10MB</li>
//               <li>• Evidence will be stored on IPFS permanently</li>
//               <li>• Validators have 72 hours to review</li>
//               <li>• Majority approval required for milestone completion</li>
//             </ul>
            
//             {/* File Type Examples */}
//             <div className="mt-3 pt-3 border-t border-[#92848b]">
//               <p className="text-sm font-semibold mb-1">Example Evidence Types:</p>
//               <div className="text-xs text-[#eeff82] space-y-1">
//                 <p>🖼️ Screenshots, photos, before/after images</p>
//                 <p>🎥 Video demonstrations, recorded sessions</p>
//                 <p>📄 Certificates, reports, completed forms</p>
//                 <p>📝 Written reflections, progress notes</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         !isLoadingDashboard && (
//           <div className="flex flex-col items-center justify-center w-full h-32 text-center">
//             <p className="text-[#eeff82] mb-2">No pending milestones! 🎉</p>
//             <p className="text-sm">Complete your current milestones or create new goals.</p>
//             <button
//               className="mt-3 bg-[#6b4b5b] px-4 py-2 rounded hover:bg-[#5a3f4a] transition-colors"
//               onClick={() => handler("PAT_LIST")}
//             >
//               View Goals
//             </button>
//           </div>
//         )
//       )}
//     </div>
//   );
// }

//   return (
//     <div className="flex flex-col p-3 w-full h-full overflow-y-auto">
//       <h1 className="text-[24px] mb-4 flex items-center gap-2">
//         🎯 MY MILESTONES
//       </h1>

//       {/* Loading State */}
//       {isLoadingDashboard && (
//         <div className="flex items-center justify-center w-full h-32">
//           <p className="text-[#eeff82]">Loading your milestones...</p>
//         </div>
//       )}

//       {/* Transaction Status */}
//       {transactionState.isProcessing && (
//         <div className="bg-[#6b4b5b] p-4 rounded mb-4">
//           <h3 className="text-[18px] mb-2">Submitting Evidence:</h3>
//           <p className="text-[#eeff82]">{transactionState.statusMessage}</p>
//           <p className="text-sm">Step: {transactionState.currentStep}</p>
//         </div>
//       )}

//       {/* Success State */}
//       {transactionState.isCompleted && (
//         <div className="bg-green-600 p-4 rounded mb-4">
//           <h3 className="text-[18px] mb-2">Evidence Submitted! 🎉</h3>
//           <p className="text-sm">Your milestone evidence has been submitted for validation.</p>
//           <p className="text-xs mt-1">Validators will review it within 72 hours.</p>
//         </div>
//       )}

//       {/* Error State */}
//       {transactionState.error && (
//         <div className="bg-red-600 p-4 rounded mb-4">
//           <h3 className="text-[18px] mb-2">Submission Failed</h3>
//           <p className="text-sm">{transactionState.error}</p>
//         </div>
//       )}

//       {/* Milestone Selection */}
//       {incompleteMilestones.length > 0 ? (
//         <div className="space-y-4">
//           <div className="bg-[#6b4b5b] p-4 rounded">
//             <h3 className="text-[18px] mb-3">Select Milestone to Submit Evidence:</h3>
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {incompleteMilestones.map((milestone) => (
//                 <div
//                   key={milestone.id}
//                   className={`bg-[#92848b] p-3 rounded cursor-pointer hover:bg-[#7a7082] transition-colors ${
//                     selectedMilestone?.id === milestone.id ? "ring-2 ring-[#eeff82]" : ""
//                   }`}
//                   onClick={() => {
//                     setSelectedMilestone(milestone);
//                     setCurrentGoalId(milestone.goalId);
//                   }}
//                 >
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <p className="font-semibold text-sm">{milestone.description}</p>
//                       <p className="text-xs text-[#eeff82]">
//                         Goal: {milestone.goal?.title}
//                       </p>
//                       <p className="text-xs">
//                         Goal ID: #{milestone.goalId} | Status: Pending
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-xs bg-[#6b4b5b] px-2 py-1 rounded">
//                         📋 Ready
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Evidence Upload Section */}
//           {selectedMilestone && (
//             <div className="bg-[#6b4b5b] p-4 rounded">
//               <h3 className="text-[18px] mb-3">Upload Evidence:</h3>
              
//               {/* Selected Milestone Info */}
//               <div className="bg-[#92848b] p-3 rounded mb-4">
//                 <h4 className="font-semibold">Selected Milestone:</h4>
//                 <p className="text-sm">{selectedMilestone.description}</p>
//                 <p className="text-xs text-[#eeff82]">Goal: {selectedMilestone.goal?.title}</p>
//               </div>

//               {/* File Upload */}
//               <div className="space-y-3">
//                 <label className="block">
//                   <span className="text-sm font-medium mb-2 block">Evidence File:</span>
//                   <input
//                     type="file"
//                     accept="image/*,video/*,.pdf,.doc,.docx"
//                     onChange={handleFileSelect}
//                     className="block w-full text-sm text-white
//                       file:mr-4 file:py-2 file:px-4
//                       file:rounded file:border-0
//                       file:text-sm file:font-semibold
//                       file:bg-[#92848b] file:text-white
//                       hover:file:bg-[#7a7082] file:cursor-pointer
//                       cursor-pointer"
//                   />
//                 </label>

//                 {/* File Info */}
//                 {evidenceFile && (
//                   <div className="bg-[#92848b] p-3 rounded">
//                     <p className="text-sm font-semibold">File Selected:</p>
//                     <p className="text-xs">Name: {evidenceFile.name}</p>
//                     <p className="text-xs">Size: {(evidenceFile.size / 1024 / 1024).toFixed(2)} MB</p>
//                     <p className="text-xs">Type: {evidenceFile.type}</p>
//                   </div>
//                 )}

//                 {/* Image Preview */}
//                 {uploadPreview && (
//                   <div className="bg-[#92848b] p-3 rounded">
//                     <p className="text-sm font-semibold mb-2">Preview:</p>
//                     <img
//                       src={uploadPreview}
//                       alt="Evidence preview"
//                       className="max-w-full max-h-40 object-contain rounded"
//                     />
//                   </div>
//                 )}

//                 {/* Action Buttons */}
//                 <div className="flex gap-3 pt-3">
//                   <button
//                     className="bg-[#92848b] px-4 py-2 rounded hover:bg-[#7a7082] transition-colors"
//                     onClick={clearSelection}
//                     disabled={isSubmitting || transactionState.isProcessing}
//                   >
//                     Clear
//                   </button>
//                   <button
//                     className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex-1"
//                     onClick={handleSubmitEvidence}
//                     disabled={!evidenceFile || isSubmitting || transactionState.isProcessing}
//                   >
//                     {isSubmitting || transactionState.isProcessing 
//                       ? "Submitting..." 
//                       : "Submit Evidence 📤"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Instructions */}
//           <div className="bg-[#6b4b5b] p-3 rounded">
//             <h3 className="text-[16px] mb-2">Submission Guidelines:</h3>
//             <ul className="text-sm space-y-1">
//               <li>• Upload clear evidence of milestone completion</li>
//               <li>• Supported: Images, videos, PDFs, documents</li>
//               <li>• Max file size: 10MB</li>
//               <li>• Evidence will be stored on IPFS</li>
//               <li>• Validators have 72 hours to review</li>
//               <li>• Majority approval required for milestone completion</li>
//             </ul>
//           </div>
//         </div>
//       ) : (
//         !isLoadingDashboard && (
//           <div className="flex flex-col items-center justify-center w-full h-32 text-center">
//             <p className="text-[#eeff82] mb-2">No pending milestones!</p>
//             <p className="text-sm">Complete your current milestones or create new goals.</p>
//             <button
//               className="mt-3 bg-[#6b4b5b] px-4 py-2 rounded hover:bg-[#5a3f4a] transition-colors"
//               onClick={() => handler("PAT_LIST")}
//             >
//               View Goals
//             </button>
//           </div>
//         )
//       )}
//     </div>
//   );
// }

// // components/modals/tabs/ValidationTab.tsx (unchanged, just moved)
// import React from "react";
// import { useGoal } from "@/app/hooks/contexts/GoalHookContext";

// interface ValidationTabProps {
//   handler: (tab: string) => void;
// }

// export function ValidationTab({ handler }: ValidationTabProps) {
//   const {
//     validationRequests,
//     isLoadingValidations,
//   } = useGoal();

//   return (
//     <div className="flex flex-col p-3 w-full h-full overflow-y-auto">
//       <h1 className="text-[24px] mb-4 flex items-center gap-2">
//         ✅ MILESTONE VALIDATION
//       </h1>
      
//       {/* Loading State */}
//       {isLoadingValidations && (
//         <div className="flex items-center justify-center w-full h-32">
//           <p className="text-[#eeff82]">Loading validation requests...</p>
//         </div>
//       )}

//       {/* Validation Requests */}
//       {validationRequests.length > 0 ? (
//         <div className="space-y-3">
//           <p className="text-sm text-[#eeff82]">
//             {validationRequests.length} pending validation{validationRequests.length !== 1 ? 's' : ''}
//           </p>
          
//           {validationRequests.map((request) => (
//             <div key={request.id} className="bg-[#6b4b5b] p-4 rounded">
//               <div className="flex justify-between items-start mb-3">
//                 <div className="flex-1">
//                   <h3 className="font-semibold">Milestone #{request.id}</h3>
//                   <p className="text-sm text-[#eeff82]">
//                     Goal ID: #{request.goalId}
//                   </p>
//                   <p className="text-sm">
//                     Submitter: {request.submitter.slice(0, 6)}...{request.submitter.slice(-4)}
//                   </p>
//                   <p className="text-sm">
//                     Goal Stake: {parseFloat(request.goalStakeAmount).toFixed(2)} PAT
//                   </p>
//                 </div>
                
//                 <div className="text-right">
//                   <p className="text-sm">
//                     Status: <span className="text-[#eeff82]">{request.status}</span>
//                   </p>
//                   <p className="text-xs">
//                     Votes: {request.currentApprovals}✅ / {request.currentRejections}❌
//                   </p>
//                   <p className="text-xs">
//                     Required: {request.requiredValidators} validators
//                   </p>
//                 </div>
//               </div>

//               {/* Evidence Display */}
//               {request.evidenceIPFS && (
//                 <div className="bg-[#92848b] p-2 rounded mb-3">
//                   <p className="text-sm font-semibold">Evidence:</p>
//                   <p className="text-xs break-all">
//                     IPFS: {request.evidenceIPFS}
//                   </p>
//                   <a 
//                     href={`https://gateway.pinata.cloud/ipfs/${request.evidenceIPFS}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-[#eeff82] text-xs underline"
//                   >
//                     View Evidence →
//                   </a>
//                 </div>
//               )}

//               {/* Deadline and Actions */}
//               <div className="flex justify-between items-center">
//                 <p className="text-xs">
//                   Deadline: {new Date(parseInt(request.deadline) * 1000).toLocaleString()}
//                 </p>
                
//                 {/* Quick Action Buttons (for admin) */}
//                 <div className="flex gap-2">
//                   <button 
//                     className="bg-green-600 px-3 py-1 text-xs rounded hover:bg-green-700"
//                     onClick={() => {
//                       alert(`Approve milestone ${request.id} - connect to validation contract`);
//                     }}
//                   >
//                     ✅ Approve
//                   </button>
//                   <button 
//                     className="bg-red-600 px-3 py-1 text-xs rounded hover:bg-red-700"
//                     onClick={() => {
//                       alert(`Reject milestone ${request.id} - connect to validation contract`);
//                     }}
//                   >
//                     ❌ Reject
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         !isLoadingValidations && (
//           <div className="flex flex-col items-center justify-center w-full h-32 text-center">
//             <p className="text-[#eeff82] mb-2">No pending validations!</p>
//             <p className="text-sm">All milestones are up to date.</p>
//           </div>
//         )
//       )}

//       {/* Validation System Info */}
//       <div className="mt-6 bg-[#6b4b5b] p-3 rounded">
//         <h3 className="text-[16px] mb-2">Validation System</h3>
//         <ul className="text-sm space-y-1">
//           <li>• Milestones require community validation</li>
//           <li>• 3-7 validators assigned based on stake amount</li>
//           <li>• 72-hour review period per milestone</li>
//           <li>• Majority vote determines approval</li>
//           <li>• Validators earn rewards for accurate decisions</li>
//         </ul>
        
//         {/* System Stats */}
//         <div className="mt-3 pt-3 border-t border-[#92848b]">
//           <p className="text-xs text-[#eeff82]">
//             Current pending validations: {validationRequests.length}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // components/modals/tabs/MintTab.tsx (unchanged, just moved)
// import React, { useState } from "react";
// import { PetType, useGoal } from "@/app/hooks/contexts/GoalHookContext";
// import { PetMetadataHelper } from "@/lib/metaDataHelper";

// interface MintTabProps {
//   handler: (tab: string) => void;
// }

// export function MintTab({ handler }: MintTabProps) {
//   const {
//     createGoalWithMilestones,
//     transactionState,
//     resetTransaction,
//     nextGoalId,
//   } = useGoal();

//   const [isCreatingGoal, setIsCreatingGoal] = useState(false);

//   const mintPet = async () => {
//     try {
//       setIsCreatingGoal(true);
//       console.log('🚀 Starting test goal creation...');
//       console.log('Next Goal ID will be:', nextGoalId);

//       // Hardcoded test goal data
//       const testGoalData = {
//         title: `Complete Fitness Challenge #${nextGoalId}`,
//         stakeAmount: "50", // 50 PAT tokens
//         durationDays: 30,
//         petName: `FitBuddy${nextGoalId}`,
//         petType: PetType.CAT, // Using CAT since it has real IPFS URLs
//         petMetadataIPFS: "", // Will be generated
//         milestoneDescriptions: [
//           "Complete Week 1: Basic exercises daily",
//           "Complete Week 2: Increase workout intensity", 
//           "Complete Week 3: Add cardio routine",
//           "Complete Week 4: Final fitness assessment"
//         ]
//       };

//       // Step 1: Generate pet metadata with real goal ID
//       console.log('📝 Generating pet metadata...');
//       const initialMetadata = PetMetadataHelper.generateInitialPetMetadata(
//         testGoalData.petName,
//         testGoalData.petType,
//         nextGoalId, // Use real nextGoalId from contract
//         testGoalData.milestoneDescriptions.length,
//         testGoalData.title
//       );

//       console.log('Generated metadata:', initialMetadata);

//       // Step 2: Upload metadata to Pinata
//       const ipfsHash = await PetMetadataHelper.uploadMetadataToPinata(
//         initialMetadata,
//       );

//       console.log('✅ Metadata uploaded, IPFS hash:', ipfsHash);

//       // Step 3: Create goal with metadata
//       const goalDataWithMetadata = {
//         ...testGoalData,
//         petMetadataIPFS: ipfsHash
//       };

//       console.log('🎯 Creating goal with milestones...');
//       await createGoalWithMilestones(goalDataWithMetadata);

//       // Note: Goal ID will be auto-incremented by the contract
//       // Our Ponder indexer will pick up the actual goalId from the GoalCreated event

//     } catch (error) {
//       console.error('❌ Failed to create test goal:', error);
//       alert(`Failed to create goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsCreatingGoal(false);
//     }
//   };

//   // Reset transaction when modal closes
//   const handleReset = () => {
//     resetTransaction();
//     handler("PAT_LIST");
//   };

//   return (
//     <div className="flex flex-col items-center justify-center p-3 w-full h-full relative">
//       <h1 className="text-[24px] mb-4 flex items-center gap-2">
//         ✨ MINT TEST PAT
//       </h1>
      
//       {/* Transaction Status Display */}
//       {transactionState.isProcessing && (
//         <div className="bg-[#6b4b5b] p-4 rounded mb-4 w-full max-w-md">
//           <h3 className="text-[18px] mb-2">Transaction Status:</h3>
//           <p className="text-[#eeff82]">{transactionState.statusMessage}</p>
//           <p>Step: {transactionState.currentStep}</p>
          
//           {transactionState.txHash && (
//             <p className="mt-2 text-sm break-all">
//               Tx Hash: {transactionState.txHash}
//             </p>
//           )}
//         </div>
//       )}

//       {/* Error Display */}
//       {transactionState.error && (
//         <div className="bg-red-600 p-4 rounded mb-4 w-full max-w-md">
//           <h3 className="text-[18px] mb-2">Error:</h3>
//           <p className="text-sm">{transactionState.error}</p>
//         </div>
//       )}

//       {/* Success Display */}
//       {transactionState.isCompleted && (
//         <div className="bg-green-600 p-4 rounded mb-4 w-full max-w-md">
//           <h3 className="text-[18px] mb-2">Success!</h3>
//           <p>Goal #{nextGoalId} created successfully!</p>
//           <p className="text-sm">Your pet will appear in the PAT LIST shortly.</p>
//           <button
//             className="mt-2 bg-[#6b4b5b] px-3 py-1 rounded"
//             onClick={handleReset}
//           >
//             View Goals
//           </button>
//         </div>
//       )}

//       {/* Test Goal Info */}
//       <div className="bg-[#6b4b5b] p-4 rounded mb-4 w-full max-w-md">
//         <h3 className="text-[18px] mb-2">Test Goal Details:</h3>
//         <ul className="text-sm space-y-1">
//           <li>🎯 Goal: Complete Fitness Challenge #{nextGoalId}</li>
//           <li>💰 Stake: 50 PAT tokens</li>
//           <li>⏱️ Duration: 30 days</li>
//           <li>🐱 Pet: FitBuddy{nextGoalId} (Cat)</li>
//           <li>📋 Milestones: 4 total</li>
//           <li>🆔 Goal ID: #{nextGoalId}</li>
//         </ul>
//       </div>

//       <div className="absolute bottom-5 right-5 flex gap-3">
//         <button
//           className="bg-[#92848b] px-5 py-2 hover:bg-[#7a7082] transition-colors"
//           onClick={() => handler("PAT_LIST")}
//           disabled={transactionState.isProcessing}
//         >
//           BACK
//         </button>
//         <button
//           className="bg-[#6b4b5b] px-5 py-2 disabled:opacity-50 hover:bg-[#5a3f4a] transition-colors"
//           onClick={mintPet}
//           disabled={transactionState.isProcessing || isCreatingGoal}
//         >
//           {isCreatingGoal || transactionState.isProcessing 
//             ? "CREATING..." 
//             : "MINT PAT TESTING"
//           }
//         </button>
//       </div>
//     </div>
//   );
// }