import { useState, useEffect, useRef, useCallback } from "react"
function DownloadSignedPDF({ envelopeId, contractData, fullAddress }) {
    const [isSendingToSeller, setIsSendingToSeller] = useState(false);
    const [sendToSellerStatus, setSendToSellerStatus] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_BASE_URL;


    const handleDownload = async () => {
        if (!envelopeId) return;

        setIsDownloading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/docusign/download-signed/${envelopeId}`);
            if (!response.ok) throw new Error('Failed to download');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Signed-Contract.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error("Download error:", error);
            alert('Failed to download contract');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSendToSeller = async () => {
        const sellerEmail = contractData?.sellerEmail || contractData?.seller?.email || contractData?.formData?.sellerEmail;
        const sellerName = contractData?.sellerName || contractData?.seller?.name || contractData?.formData?.sellerName;

        if (!sellerEmail?.trim()) return alert('Seller email is required');
        if (!sellerName?.trim()) return alert('Seller name is required');

        setIsSendingToSeller(true);
        setSendToSellerStatus(null);

        try {
            const response = await fetch(`${API_BASE_URL}/docusign/send-to-seller`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    envelopeId,
                    sellerEmail: sellerEmail.trim(),
                    sellerName: sellerName.trim(),
                    contractData,
                    fullAddress: encodeURIComponent(fullAddress)
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to send');

            setSendToSellerStatus('success');
            if (data.sellerEnvelopeId) {
                sessionStorage.setItem(`sellerEnvelopeId_${fullAddress}`, data.sellerEnvelopeId);
            }
        } catch (error) {
            console.error("Send to seller error:", error);
            setSendToSellerStatus('error');
        } finally {
            setIsSendingToSeller(false);
        }
    };

    const hasSellerInfo = contractData?.sellerEmail || contractData?.seller?.email || contractData?.formData?.sellerEmail;

    return (
        <div className="max-w-md mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Contract Signed</h2>
                <p className="text-[var(--mafia-red)]">Your document is ready</p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={handleDownload}
                    disabled={!envelopeId || isDownloading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                    {isDownloading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Downloading...
                        </>
                    ) : (
                        'Download Signed Contract'
                    )}
                </button>

                {hasSellerInfo && (
                    <button
                        onClick={handleSendToSeller}
                        disabled={!envelopeId || isSendingToSeller}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                        {isSendingToSeller ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </>
                        ) : (
                            'Send to Seller for Signature'
                        )}
                    </button>
                )}

                {!hasSellerInfo && (
                    <div className="p-3 bg-yellow-50 rounded-md text-sm text-yellow-700">
                        Seller information not found to send contract
                    </div>
                )}

                {sendToSellerStatus === 'success' && (
                    <div className="p-3 bg-green-50 rounded-md text-sm text-green-700">
                        <p>Contract sent successfully</p>
                        <SellerSigningStatus
                            sellerEnvelopeId={sessionStorage.getItem(`sellerEnvelopeId_${fullAddress}`)}
                            fullAddress={fullAddress}
                        />
                    </div>
                )}

                {sendToSellerStatus === 'error' && (
                    <div className="p-3 bg-red-50 rounded-md text-sm text-red-700">
                        Failed to send contract. Please try again.
                    </div>
                )}
            </div>
        </div>
    );
}

function SellerSigningStatus({ sellerEnvelopeId, fullAddress }) {
    const [status, setStatus] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_BASE_URL;

    const checkStatus = async () => {
        if (!sellerEnvelopeId) return;
        setIsChecking(true);
        try {
            const response = await fetch(`${API_BASE_URL}/docusign/seller-envelope-status/${sellerEnvelopeId}?fullAddress=${encodeURIComponent(fullAddress)}`);
            const data = await response.json();
            if (response.ok) setStatus(data);
        } catch (error) {
            console.error('Error checking status:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const downloadFullySigned = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/docusign/download-seller-signed/${sellerEnvelopeId}?fullAddress=${encodeURIComponent(fullAddress)}`);
            if (!response.ok) throw new Error('Failed to download');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Fully-Signed-Contract.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error("Download error:", error);
            alert('Failed to download contract');
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        if (sellerEnvelopeId) {
            checkStatus();
            const interval = setInterval(checkStatus, 30000);
            return () => clearInterval(interval);
        }
    }, [sellerEnvelopeId, fullAddress]);

    if (!sellerEnvelopeId) return null;

    return (
        <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
                <span className="font-medium">Seller Status:</span>
                <button
                    onClick={checkStatus}
                    disabled={isChecking}
                    className="text-xs text-indigo-600 hover:text-indigo-500"
                >
                    {isChecking ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {status ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span>{status.status.charAt(0).toUpperCase() + status.status.slice(1)}</span>
                    </div>

                    {status.completed && (
                        <button
                            onClick={downloadFullySigned}
                            disabled={isDownloading}
                            className="w-full mt-2 text-sm flex items-center justify-center px-3 py-1 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isDownloading ? 'Downloading...' : 'Download Fully Signed'}
                        </button>
                    )}
                </div>
            ) : (
                <div className="text-gray-500">Checking status...</div>
            )}
        </div>
    );
}

export default DownloadSignedPDF;