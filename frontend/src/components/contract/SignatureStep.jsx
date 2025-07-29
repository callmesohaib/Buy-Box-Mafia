import { motion } from "framer-motion";
import { PenTool, RefreshCw, RotateCcw, ExternalLink } from "lucide-react";
import { fadeInUp, scaleIn } from "../../animations/animation";
import { useState, useEffect } from "react";

export default function SignatureStep({ envelopeId, signingUrl }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consentRequired, setConsentRequired] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRefreshCount, setAutoRefreshCount] = useState(0);
  const [manualSignClicked, setManualSignClicked] = useState(false);
  const maxRetries = 3;
  const maxAutoRefresh = 2;

  // Auto-refresh mechanism
  useEffect(() => {
    // Reset states when props change
    setLoading(true);
    setError("");
    setRetryCount(0);
    setAutoRefreshCount(0);
    setManualSignClicked(false);
    
    // Give a short delay to allow signingUrl to be available
    const timer = setTimeout(() => {
      if (signingUrl) {
        // Auto-redirect to DocuSign signing
        window.location.href = signingUrl;
      } else {
        // If no signing URL, try auto-refresh only if we haven't tried too many times
        if (autoRefreshCount < maxAutoRefresh) {
          setAutoRefreshCount(prev => prev + 1);
          setLoading(true);
          setError("");
          
          // Auto-refresh the page after a delay
          setTimeout(() => {
            // Force a hard reload of the page
            window.location.reload(true);
          }, 2000);
        } else {
          setError("No signing URL provided. Please go back and try again.");
          setLoading(false);
        }
      }
    }, 1500); // Increased delay to 1.5 seconds to allow more time for stored data

    return () => clearTimeout(timer);
  }, [signingUrl, autoRefreshCount]);

  // Retry mechanism for when signingUrl is not available
  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setLoading(true);
      setError("");
      
      // Wait a bit longer each retry
      const timer = setTimeout(() => {
        if (signingUrl) {
          window.location.href = signingUrl;
        } else {
          setError("Still no signing URL available. Please go back to the previous step and try again.");
          setLoading(false);
        }
      }, 2000 * (retryCount + 1)); // Progressive delay

      return () => clearTimeout(timer);
    } else {
      setError("Maximum retries reached. Please go back to the previous step and try again.");
      setLoading(false);
    }
  };

  // Manual refresh function - force hard reload
  const handleManualRefresh = () => {
    setLoading(true);
    setError("");
    setRetryCount(0);
    setAutoRefreshCount(0);
    
    // Force a hard reload of the page
    window.location.reload(true);
  };

  // Manual sign with DocuSign function
  const handleManualSign = () => {
    setManualSignClicked(true);
    setLoading(true);
    setError("");
    
    // First reload the page to ensure fresh data
    setTimeout(() => {
      window.location.reload(true);
    }, 1000);
  };

  // Immediate refresh when component mounts if no signingUrl
  useEffect(() => {
    if (!signingUrl && autoRefreshCount === 0 && !manualSignClicked) {
      // If no signing URL on first load, wait a bit longer to allow stored data to load
      const refreshTimer = setTimeout(() => {
        window.location.reload(true);
      }, 3000); // Increased to 3 seconds to allow more time for stored data
      
      return () => clearTimeout(refreshTimer);
    }
  }, [signingUrl, autoRefreshCount, manualSignClicked]);

  const handleConsent = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/docusign/consent-url");
      if (!res.ok) throw new Error("Failed to get consent URL");
      const data = await res.json();
      window.location.href = data.url;
    } catch (e) {
      setError(e.message || "Consent URL error");
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="text-center"
    >
      <motion.div 
        variants={scaleIn}
        className="bg-[var(--secondary-gray-bg)] rounded-2xl p-8 shadow-sm border border-[var(--tertiary-gray-bg)] max-w-md mx-auto"
      >
        <div className="w-16 h-16 bg-[var(--mafia-red)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <PenTool size={32} className="text-[var(--mafia-red)]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Digital Signature</h3>
        <p className="text-[var(--primary-gray-text)] mb-6">Sign the contract using your digital signature</p>
        
        {loading && !error && (
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-500 p-3 rounded-lg mb-4">
            <p>Preparing your document for signing...</p>
            {autoRefreshCount > 0 && (
              <p className="text-sm mt-1">Auto-refresh attempt {autoRefreshCount} of {maxAutoRefresh + 1}</p>
            )}
            {retryCount > 0 && (
              <p className="text-sm mt-1">Manual retry attempt {retryCount} of {maxRetries + 1}</p>
            )}
            {!signingUrl && autoRefreshCount === 0 && (
              <p className="text-sm mt-1">No signing URL detected, refreshing page...</p>
            )}
            {manualSignClicked && (
              <p className="text-sm mt-1">Reloading page to prepare signing...</p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-lg mb-4">
            <p className="mb-3">{error}</p>
            <div className="space-y-2">
              {retryCount < maxRetries && (
                <button
                  onClick={handleRetry}
                  className="flex items-center justify-center gap-2 w-full bg-red-500 text-white py-2 px-4 rounded font-medium hover:bg-red-600 transition-colors"
                >
                  <RefreshCw size={16} />
                  Retry ({maxRetries - retryCount} attempts left)
                </button>
              )}
              {autoRefreshCount < maxAutoRefresh && (
                <button
                  onClick={handleManualRefresh}
                  className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white py-2 px-4 rounded font-medium hover:bg-blue-600 transition-colors"
                >
                  <RotateCcw size={16} />
                  Refresh Page ({maxAutoRefresh - autoRefreshCount} attempts left)
                </button>
              )}
            </div>
          </div>
        )}

        {consentRequired && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-3 rounded-lg mb-4">
            <p className="mb-2">You need to grant consent before signing</p>
            <button
              onClick={handleConsent}
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded font-medium"
            >
              {loading ? "Processing..." : "Grant Consent"}
            </button>
          </div>
        )}

        {/* Manual Sign with DocuSign button */}
        {!loading && !error && !consentRequired && (
          <div className="mt-6">
            <button
              onClick={handleManualSign}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full bg-[var(--mafia-red)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--mafia-red)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)] shadow"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Preparing...
                </>
              ) : (
                <>
                  <ExternalLink size={20} />
                  Sign with DocuSign
                </>
              )}
            </button>
            <p className="text-xs text-[var(--secondary-gray-text)] mt-2">
              Click to reload page and open DocuSign signing
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}