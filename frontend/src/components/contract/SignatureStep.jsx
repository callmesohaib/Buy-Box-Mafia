import { motion } from "framer-motion";
import { PenTool, ExternalLink } from "lucide-react";
import { fadeInUp, scaleIn } from "../../animations/animation";
import { useState, useEffect } from "react";

export default function SignatureStep({ envelopeId, fullAddress }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingUrl, setSigningUrl] = useState(null);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchSigningUrl = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `${API_BASE_URL}/docusign/get-signing-url/${envelopeId}?fullAddress=${encodeURIComponent(fullAddress)}`
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message = data?.error || data?.details || "Failed to get signing URL";
          throw new Error(message);
        }

        if (!data?.url) {
          throw new Error("DocuSign did not return a signing URL");
        }

        setSigningUrl(data.url);
      } catch (err) {
        setError(err.message || "Failed to get signing URL");
      } finally {
        setLoading(false);
      }
    };

    if (envelopeId) {
      fetchSigningUrl();
    } else {
      setError("Envelope ID is missing");
      setLoading(false);
    }
  }, [envelopeId, fullAddress]);

  // Redirect in same tab when URL is available
  useEffect(() => {
    if (signingUrl && !redirectAttempted) {
      setRedirectAttempted(true);
      // optional small delay so user sees the UI change before redirect
      setTimeout(() => {
        // navigate in the same tab (not a new one)
        window.location.href = signingUrl;
      }, 400);
    }
  }, [signingUrl, redirectAttempted]);

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
        
        {loading && (
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-500 p-3 rounded-lg mb-4">
            <p>Generating signing session...</p>
            <div className="mt-2 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-lg mb-4">
            <p className="mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full bg-red-500 text-white py-2 px-4 rounded font-medium hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && signingUrl && (
          <div className="mt-6">
            <button
              onClick={() => { window.location.href = signingUrl; }}
              className="flex items-center justify-center gap-3 w-full bg-[var(--mafia-red)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--mafia-red)]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)] shadow"
            >
              <ExternalLink size={20} />
              Open Signing Page
            </button>
            <p className="text-xs text-[var(--secondary-gray-text)] mt-2">
              If signing didn't start automatically, click above to open DocuSign in this tab
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
