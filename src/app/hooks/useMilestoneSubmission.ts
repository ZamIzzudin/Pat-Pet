// Enhanced milestone submission hook
// hooks/useEnhancedMilestoneSubmission.ts
import { useState } from 'react';
import { useGoal } from '@/app/hooks/contexts/GoalHookContext';
import { PinataEvidenceUploader, EvidenceUploadResult } from '@/lib/pinataUploader';
import { useAccount } from 'wagmi';

export interface EnhancedSubmitMilestoneParams {
  milestoneId: string;
  evidenceFile: File;
  description?: string;
  goalId: string;
}

export interface SubmissionProgress {
  step: 'idle' | 'validating' | 'uploading' | 'submitting' | 'completed' | 'error';
  message: string;
  progress: number; // 0-100
  uploadResult?: EvidenceUploadResult;
  error?: string;
}

export function useMilestoneSubmission() {
  const { address: userAddress } = useAccount();
  const { submitMilestone, transactionState } = useGoal();
  
  const [submissionProgress, setSubmissionProgress] = useState<SubmissionProgress>({
    step: 'idle',
    message: 'Ready to submit evidence',
    progress: 0,
  });

  const submitMilestoneWithEvidence = async (params: EnhancedSubmitMilestoneParams) => {
    if (!userAddress) {
      throw new Error('User not connected');
    }

    try {
      // Step 1: Validate file
      setSubmissionProgress({
        step: 'validating',
        message: 'Validating evidence file...',
        progress: 10,
      });

      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX

      // Step 2: Upload to Pinata
      setSubmissionProgress({
        step: 'uploading',
        message: 'Uploading evidence to IPFS...',
        progress: 30,
      });

      // Extract goal ID from milestone ID (assuming format: goalId_milestoneIndex)
      // const goalId = params.milestoneId.split('_')[0];
      
      const uploadResult = await PinataEvidenceUploader.uploadEvidenceFile(
        params.evidenceFile,
        params.milestoneId,
        params.goalId,
        userAddress
      );

      setSubmissionProgress({
        step: 'uploading',
        message: 'Evidence uploaded successfully!',
        progress: 70,
        uploadResult,
      });

      // Step 3: Submit milestone to contract
      setSubmissionProgress({
        step: 'submitting',
        message: 'Submitting milestone to blockchain...',
        progress: 80,
        uploadResult,
      });

      console.log(uploadResult, "UPLOAD RESULT");

      // Use the original submitMilestone function with IPFS hash
      await submitMilestone({
        milestoneId: params.milestoneId,
        evidenceFile: params.evidenceFile, // Still pass file for compatibility
        evidenceIPFS: uploadResult.ipfsHash, // Add IPFS hash
      });

      setSubmissionProgress({
        step: 'completed',
        message: 'Milestone evidence submitted successfully!',
        progress: 100,
        uploadResult,
      });

    } catch (error) {
      console.error('❌ Enhanced milestone submission failed:', error);
      
      setSubmissionProgress({
        step: 'error',
        message: 'Submission failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };

  const resetSubmission = () => {
    setSubmissionProgress({
      step: 'idle',
      message: 'Ready to submit evidence',
      progress: 0,
    });
  };

  return {
    submitMilestoneWithEvidence,
    submissionProgress,
    resetSubmission,
    isSubmitting: submissionProgress.step !== 'idle' && submissionProgress.step !== 'completed' && submissionProgress.step !== 'error',
    isCompleted: submissionProgress.step === 'completed',
    hasError: submissionProgress.step === 'error',
  };
}