// components/modals/tabs/MyMilestonesTab.tsx - Updated with Enhanced Hook
import React, { useState } from "react";
import { useGoal, FormattedGoalInfo } from "@/app/hooks/contexts/GoalHookContext";
import { useMilestoneSubmission } from "@/app/hooks/useMilestoneSubmission";

interface MyMilestonesTabProps {
  handler: (tab: string) => void;
}

interface MilestoneWithGoal {
  id: string;
  goalId: string;
  description: string;
  isCompleted: boolean;
  evidenceIPFS?: string;
  createdAt: string;
  goal?: FormattedGoalInfo;
}

export function MyMilestonesTab({ handler }: MyMilestonesTabProps) {
  const {
    userGoals,
    currentMilestones,
    transactionState,
    isLoadingDashboard,
    setCurrentGoalId,
  } = useGoal();

  // Use the enhanced milestone submission hook
  const {
    submitMilestoneWithEvidence,
    submissionProgress,
    resetSubmission,
    isSubmitting,
    isCompleted,
    hasError,
  } = useMilestoneSubmission();

  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneWithGoal | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  // Effect to load real milestones when a goal is selected
  React.useEffect(() => {
    if (selectedMilestone && selectedMilestone.id.startsWith('pending_')) {
      // This is a placeholder milestone, we need to fetch real ones
      setLoadingMilestones(true);
      setCurrentGoalId(selectedMilestone.goalId);
      
      // Wait a bit for GraphQL to update, then use real milestone data
      setTimeout(() => {
        if (currentMilestones && currentMilestones.length > 0) {
          const realMilestone = currentMilestones.find(m => 
            m.goalId === selectedMilestone.goalId && !m.isCompleted
          );
          
          if (realMilestone) {
            const realMilestoneWithGoal: MilestoneWithGoal = {
              id: realMilestone.id, // Real milestone ID from contract
              goalId: realMilestone.goalId,
              description: realMilestone.description,
              isCompleted: realMilestone.isCompleted,
              evidenceIPFS: realMilestone.evidenceIPFS,
              createdAt: realMilestone.createdAt,
              goal: selectedMilestone.goal,
            };
            
            setSelectedMilestone(realMilestoneWithGoal);
            console.log('✅ Updated to real milestone:', realMilestoneWithGoal);
          }
        }
        setLoadingMilestones(false);
      }, 1000);
    }
  }, [selectedMilestone?.id, currentMilestones, setCurrentGoalId]);

  const allMilestones: MilestoneWithGoal[] = userGoals.flatMap((goal) => {
    // First, get real milestones from currentMilestones if this goal is selected
    if (goal.id === selectedMilestone?.goalId) {
      // Use real milestone data from GraphQL
      return currentMilestones.map(milestone => ({
        id: milestone.id, // Real milestone ID from contract
        goalId: milestone.goalId,
        description: milestone.description,
        isCompleted: milestone.isCompleted,
        evidenceIPFS: milestone.evidenceIPFS,
        createdAt: milestone.createdAt,
        goal: goal,
      }));
    }
    
    // For other goals, generate placeholder milestones
    const milestones: MilestoneWithGoal[] = [];
    
    for (let i = 0; i < goal.totalMilestones; i++) {
      const milestoneIndex = i; // 0-based index
      milestones.push({
        id: `pending_${goal.id}_${milestoneIndex}`, // Placeholder ID
        goalId: goal.id,
        description: `Milestone ${i + 1}: ${getMilestoneDescription(goal.title, i)}`,
        isCompleted: i < goal.milestonesCompleted,
        createdAt: goal.createdAt,
        goal: goal,
      });
    }
    
    return milestones;
  });

  // Get available real milestones for display
  const getAvailableMilestones = (): MilestoneWithGoal[] => {
    const realFromGraphQL = currentMilestones
      .filter(m => !m.isCompleted)
      .map(milestone => {
        const goal = userGoals.find(g => g.id === milestone.goalId);
        return {
          id: milestone.id, // Real milestone ID
          goalId: milestone.goalId,
          description: milestone.description,
          isCompleted: milestone.isCompleted,
          evidenceIPFS: milestone.evidenceIPFS,
          createdAt: milestone.createdAt,
          goal: goal,
        } as MilestoneWithGoal;
      });

    // If we have real milestones from GraphQL, use those
    if (realFromGraphQL.length > 0) {
      return realFromGraphQL;
    }

    // Otherwise, return placeholder milestones for selection
    return allMilestones.filter(m => !m.isCompleted);
  };

  const availableMilestones = getAvailableMilestones();

  // Generate meaningful milestone descriptions based on goal title
  function getMilestoneDescription(goalTitle: string, index: number): string {
    const descriptions = [
      "Complete initial setup and preparation",
      "Reach halfway progress milestone", 
      "Complete advanced phase",
      "Final completion and review"
    ];
    
    if (goalTitle.toLowerCase().includes('fitness')) {
      const fitnessDescriptions = [
        "Complete Week 1: Basic exercises daily",
        "Complete Week 2: Increase workout intensity",
        "Complete Week 3: Add cardio routine", 
        "Complete Week 4: Final fitness assessment"
      ];
      return fitnessDescriptions[index] || descriptions[index];
    }
    
    return descriptions[index] || `Complete phase ${index + 1}`;
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size too large. Maximum allowed: 10MB");
        return;
      }

      setEvidenceFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadPreview(null);
      }
    }
  };

  const handleSubmitEvidence = async () => {
    if (!selectedMilestone || !evidenceFile) {
      alert("Please select a milestone and upload evidence file");
      return;
    }

    // Check if this is a real milestone ID (not a placeholder)
    if (selectedMilestone.id.startsWith('pending_')) {
      alert("Please wait for the real milestone data to load, or refresh the page and try again.");
      return;
    }

    // Validate that milestone ID is a valid number
    const milestoneIdNumber = parseInt(selectedMilestone.id);
    if (isNaN(milestoneIdNumber)) {
      alert(`Invalid milestone ID: ${selectedMilestone.id}. Please refresh and try again.`);
      return;
    }

    // Ensure we have the goal ID
    if (!selectedMilestone.goalId) {
      alert("Goal ID is missing. Please refresh and try again.");
      return;
    }

    try {
      console.log('🚀 Submitting milestone evidence with enhanced hook...', {
        milestoneId: selectedMilestone.id,
        goalId: selectedMilestone.goalId, // Pass goalId explicitly
        fileName: evidenceFile.name,
        fileSize: evidenceFile.size,
        fileType: evidenceFile.type,
      });

      // Use the enhanced submission hook with goalId
      await submitMilestoneWithEvidence({
        milestoneId: selectedMilestone.id,
        evidenceFile: evidenceFile,
        goalId: selectedMilestone.goalId, // Pass goalId for IPFS tagging
      });

      // Reset form after success (with delay to show success state)
      setTimeout(() => {
        setSelectedMilestone(null);
        setEvidenceFile(null);
        setUploadPreview(null);
        resetSubmission();
      }, 3000);
      
    } catch (error) {
      console.error('❌ Failed to submit milestone with enhanced hook:', error);
      // Error is handled by the hook
    }
  };

  const clearSelection = () => {
    setSelectedMilestone(null);
    setEvidenceFile(null);
    setUploadPreview(null);
    resetSubmission();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType: string): string => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('zip')) return '📦';
    return '📎';
  };

  return (
    <div className="flex flex-col p-3 w-full h-full overflow-y-auto">
      <h1 className="text-[24px] mb-4 flex items-center gap-2">
        🎯 MY MILESTONES
      </h1>

      {/* Loading State */}
      {isLoadingDashboard && (
        <div className="flex items-center justify-center w-full h-32">
          <p className="text-[#eeff82]">Loading your milestones...</p>
        </div>
      )}

      {/* Enhanced Progress Display from Hook */}
      {isSubmitting && (
        <div className="bg-[#6b4b5b] p-4 rounded mb-4">
          <h3 className="text-[18px] mb-2">Submitting Evidence:</h3>
          <p className="text-[#eeff82] mb-2">{submissionProgress.message}</p>
          <div className="bg-[#92848b] rounded-full h-3 mb-2">
            <div 
              className="bg-[#eeff82] h-3 rounded-full transition-all duration-500"
              style={{ width: `${submissionProgress.progress}%` }}
            />
          </div>
          <p className="text-xs">Progress: {submissionProgress.progress}%</p>
          
          {/* Show IPFS upload result */}
          {submissionProgress.uploadResult && (
            <div className="mt-3 p-2 bg-[#92848b] rounded">
              <p className="text-xs font-semibold">IPFS Upload Complete:</p>
              <p className="text-xs break-all">Hash: {submissionProgress.uploadResult.ipfsHash}</p>
              <p className="text-xs">Size: {formatFileSize(submissionProgress.uploadResult.fileSize)}</p>
              <a 
                href={submissionProgress.uploadResult.gatewayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#eeff82] text-xs underline"
              >
                View Evidence →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Transaction Status from useGoal */}
      {transactionState.isProcessing && (
        <div className="bg-[#6b4b5b] p-4 rounded mb-4">
          <h3 className="text-[18px] mb-2">Blockchain Transaction:</h3>
          <p className="text-[#eeff82]">{transactionState.statusMessage}</p>
          <p className="text-sm">Step: {transactionState.currentStep}</p>
        </div>
      )}

      {/* Success State from Hook */}
      {isCompleted && (
        <div className="bg-green-600 p-4 rounded mb-4">
          <h3 className="text-[18px] mb-2">Evidence Submitted! 🎉</h3>
          <p className="text-sm">Your milestone evidence has been submitted for validation.</p>
          <p className="text-xs mt-1">Validators will review it within 72 hours.</p>
          
          {submissionProgress.uploadResult && (
            <div className="mt-3 p-2 bg-green-700 rounded">
              <p className="text-xs font-semibold">Evidence Details:</p>
              <p className="text-xs">File: {submissionProgress.uploadResult.fileName}</p>
              <p className="text-xs">IPFS: {submissionProgress.uploadResult.ipfsHash}</p>
              <p className="text-xs">Goal ID: {selectedMilestone?.goalId}</p>
              <a 
                href={submissionProgress.uploadResult.gatewayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#eeff82] text-xs underline"
              >
                View Evidence →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Error State from Hook */}
      {hasError && (
        <div className="bg-red-600 p-4 rounded mb-4">
          <h3 className="text-[18px] mb-2">Submission Failed</h3>
          <p className="text-sm">{submissionProgress.error}</p>
          <button
            className="mt-2 bg-red-700 px-3 py-1 rounded text-sm hover:bg-red-800"
            onClick={clearSelection}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Milestone Selection */}
      {availableMilestones.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-[#6b4b5b] p-4 rounded">
            <h3 className="text-[18px] mb-3">Select Milestone to Submit Evidence:</h3>
            
            {/* Show info about milestone loading */}
            {userGoals.length > 0 && currentMilestones.length === 0 && (
              <div className="bg-[#92848b] p-3 rounded mb-3">
                <p className="text-sm text-[#eeff82]">
                  💡 Tip: Click on a goal first to load its real milestones, or select a placeholder to load them automatically.
                </p>
              </div>
            )}
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`bg-[#92848b] p-3 rounded cursor-pointer hover:bg-[#7a7082] transition-colors ${
                    selectedMilestone?.id === milestone.id ? "ring-2 ring-[#eeff82]" : ""
                  }`}
                  onClick={() => {
                    setSelectedMilestone(milestone);
                    if (!milestone.id.startsWith('pending_')) {
                      // Real milestone, set goal as current
                      setCurrentGoalId(milestone.goalId);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{milestone.description}</p>
                      <p className="text-xs text-[#eeff82]">
                        Goal: {milestone.goal?.title}
                      </p>
                      <p className="text-xs">
                        Goal ID: #{milestone.goalId} | 
                        Milestone ID: {milestone.id.startsWith('pending_') ? 'Loading...' : `#${milestone.id}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        milestone.id.startsWith('pending_') 
                          ? 'bg-yellow-600 text-yellow-100' 
                          : 'bg-[#6b4b5b] text-white'
                      }`}>
                        {milestone.id.startsWith('pending_') ? '⏳ Loading' : '📋 Ready'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Loading indicator for milestones */}
            {loadingMilestones && (
              <div className="mt-3 p-2 bg-[#92848b] rounded">
                <p className="text-sm text-[#eeff82] flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Loading real milestone data...
                </p>
              </div>
            )}
          </div>

          {/* Evidence Upload Section */}
          {selectedMilestone && (
            <div className="bg-[#6b4b5b] p-4 rounded">
              <h3 className="text-[18px] mb-3">Upload Evidence:</h3>
              
              {/* Selected Milestone Info */}
              <div className="bg-[#92848b] p-3 rounded mb-4">
                <h4 className="font-semibold flex items-center gap-2">
                  🎯 Selected Milestone:
                </h4>
                <p className="text-sm">{selectedMilestone.description}</p>
                <p className="text-xs text-[#eeff82]">Goal: {selectedMilestone.goal?.title}</p>
                <p className="text-xs">Milestone ID: {selectedMilestone.id}</p>
                <p className="text-xs">Goal ID: {selectedMilestone.goalId}</p>
              </div>

              {/* Enhanced File Upload */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium mb-2 block">Evidence File:</span>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
                      onChange={handleFileSelect}
                      disabled={isSubmitting}
                      className="block w-full text-sm text-white
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#92848b] file:text-white
                        hover:file:bg-[#7a7082] file:cursor-pointer
                        cursor-pointer disabled:opacity-50"
                    />
                  </div>
                </label>

                {/* File Info */}
                {evidenceFile && (
                  <div className="bg-[#92848b] p-3 rounded">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {getFileTypeIcon(evidenceFile.type)}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">File Selected:</p>
                        <p className="text-xs">Name: {evidenceFile.name}</p>
                        <p className="text-xs">Size: {formatFileSize(evidenceFile.size)}</p>
                        <p className="text-xs">Type: {evidenceFile.type}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                {uploadPreview && (
                  <div className="bg-[#92848b] p-3 rounded">
                    <p className="text-sm font-semibold mb-2">Preview:</p>
                    <img
                      src={uploadPreview}
                      alt="Evidence preview"
                      className="max-w-full max-h-40 object-contain rounded mx-auto"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    className="bg-[#92848b] px-4 py-2 rounded hover:bg-[#7a7082] transition-colors"
                    onClick={clearSelection}
                    disabled={isSubmitting || transactionState.isProcessing}
                  >
                    Clear
                  </button>
                  <button
                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex-1 flex items-center justify-center gap-2"
                    onClick={handleSubmitEvidence}
                    disabled={!evidenceFile || isSubmitting || transactionState.isProcessing || selectedMilestone?.id.startsWith('pending_')}
                  >
                    {isSubmitting || transactionState.isProcessing ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        {isSubmitting ? submissionProgress.message : transactionState.statusMessage}
                      </>
                    ) : selectedMilestone?.id.startsWith('pending_') ? (
                      "⏳ Loading milestone data..."
                    ) : (
                      <>
                        📤 Submit Evidence
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-[#6b4b5b] p-3 rounded">
            <h3 className="text-[16px] mb-2">Submission Guidelines:</h3>
            <ul className="text-sm space-y-1">
              <li>• Upload clear evidence of milestone completion</li>
              <li>• Supported: Images, videos, PDFs, documents</li>
              <li>• Max file size: 10MB</li>
              <li>• Evidence will be stored on IPFS permanently</li>
              <li>• Validators have 72 hours to review</li>
              <li>• Majority approval required for milestone completion</li>
            </ul>
            
            {/* File Type Examples */}
            <div className="mt-3 pt-3 border-t border-[#92848b]">
              <p className="text-sm font-semibold mb-1">Example Evidence Types:</p>
              <div className="text-xs text-[#eeff82] space-y-1">
                <p>🖼️ Screenshots, photos, before/after images</p>
                <p>🎥 Video demonstrations, recorded sessions</p>
                <p>📄 Certificates, reports, completed forms</p>
                <p>📝 Written reflections, progress notes</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !isLoadingDashboard && (
          <div className="flex flex-col items-center justify-center w-full h-32 text-center">
            <p className="text-[#eeff82] mb-2">No pending milestones! 🎉</p>
            <p className="text-sm">Complete your current milestones or create new goals.</p>
            <button
              className="mt-3 bg-[#6b4b5b] px-4 py-2 rounded hover:bg-[#5a3f4a] transition-colors"
              onClick={() => handler("PAT_LIST")}
            >
              View Goals
            </button>
          </div>
        )
      )}
    </div>
  );
}