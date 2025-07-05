import React from "react";
import { useGoal } from "@/app/hooks/contexts/GoalHookContext";

interface ValidationTabProps {
  handler: (tab: string) => void;
}

export function ValidationTab({ handler }: ValidationTabProps) {
  const {
    validationRequests,
    isLoadingValidations,
  } = useGoal();

  return (
    <div className="flex flex-col p-3 w-full h-full overflow-y-auto">
      <h1 className="text-[24px] mb-4 flex items-center gap-2">
        ✅ MILESTONE VALIDATION
      </h1>
      
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
                    href={`${process.env.NEXT_PUBLIC_PAT_PET_PINATA_GATEWAY}/ipfs/${request.evidenceIPFS}`}
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
                      alert(`Approve milestone ${request.id} - connect to validation contract`);
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button 
                    className="bg-red-600 px-3 py-1 text-xs rounded hover:bg-red-700"
                    onClick={() => {
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