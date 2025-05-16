import React from "react";

export const SubmitionModal = ({
    isOpen,
    onClose,
    score,
    code,
    submissionId,
    submissionTeam
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
            <div className="rounded-2xl shadow-lg w-full max-w-2xl p-6 bg-[#101829]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        Submission Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                    >
                        &times;
                    </button>
                </div>

                <div className="space-y-4 ">
                    <div>
                        <strong>Score:</strong> {score}
                    </div>
                    <div>
                        <strong>Submission ID:</strong> {submissionId}
                    </div>
                    <div>
                        <strong>Team:</strong> {submissionTeam}
                    </div>
                    <div>
                        <strong>Code:</strong>
                        <pre className="mt-1p-3 rounded text-xs overflow-auto max-h-64">
                            <code>{code}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};
