import { useState, useEffect, useRef } from "react"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, PenTool } from "lucide-react"
import { fadeInDown, fadeInUp, buttonHover } from "../animations/animation"
import ProgressSteps from "../components/contract/ProgressSteps"
import ContractForm from "../components/contract/ContractForm"
import ContractPreview from "../components/contract/ContractPreview"
import SignatureStep from "../components/contract/SignatureStep"
import { generateContractPDF } from "../components/contract/ContractPreview";
import { addDeal } from "../services/dealsService";
import { useAuth } from "../store/AuthContext"

export default function ContractPreparation() {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const query = new URLSearchParams(location.search);
  const initialStep = parseInt(query.get('step')) || 0;
  const [currentStep, setCurrentStepState] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const defaultDropdowns = {
    financingType: "Cash",
    surveyRequired: "Yes",
    titleInsurance: "Yes",
    inspectionPeriod: "7 days",
  };
  const initialContractData = (location.state && location.state.contractData)
    ? { ...defaultDropdowns, ...location.state.contractData }
    : { ...defaultDropdowns };
  const [contractData, setContractData] = useState(initialContractData);
  const [errors, setErrors] = useState({});
  const mlsNumber = dealId;
  const [propertyData, setPropertyData] = useState(null);

  useEffect(() => {
    if (!mlsNumber) return;
    setIsLoading(true);
    setPropertyData(null);
    fetch(`https://api.repliers.io/listings/${mlsNumber}`, {
      headers: {
        'REPLIERS-API-KEY': '41MCTXQRjF5HUStcQkFuNfYhGU56Je',
        'accept': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch property');
        return res.json();
      })
      .then((data) => {
        setPropertyData(data);
        setIsLoading(false);
      })
      .catch((e) => {
        setPropertyData(null);
        setIsLoading(false);
      });
  }, [mlsNumber]);


  // Update contractData state when propertyData changes
  useEffect(() => {
    if (propertyData) {
      setContractData(prev => ({
        ...prev,
        mlsNumber: propertyData?.mlsNumber || '',
        propertyAddress: propertyData?.address
          ? `${propertyData.address.streetNumber || ''} ${propertyData.address.streetName || ''} ${propertyData.address.streetSuffix || ''}, ${propertyData.address.city || ''}, ${propertyData.address.state || ''} ${propertyData.address.zip || ''}`.replace(/ +/g, ' ').trim()
          : '',
        propertyCity: propertyData?.address?.city || '',
        propertyState: propertyData?.address?.area || '',
        propertyCountry: propertyData?.address?.country || '',
        propertyPrice: propertyData?.originalPrice || '',
        propertyType: propertyData?.type || '',
        propertyZoning: propertyData?.class || '',
        propertyClass: propertyData?.class || '',
        listPrice: propertyData?.listPrice || '',
        listDate: propertyData?.listDate || '',
        status: propertyData?.status || '',
      }));
    }
  }, [propertyData]);

  // Load stored envelope data when component mounts
  useEffect(() => {
    if (dealId) {
      const storedEnvelopeId = sessionStorage.getItem(`envelopeId_${dealId}`);
      const storedSigningUrl = sessionStorage.getItem(`signingUrl_${dealId}`);
      const storedContractData = sessionStorage.getItem(`contractData_${dealId}`);

      if (storedEnvelopeId && storedSigningUrl) {
        setContractData(prev => ({
          ...prev,
          envelopeId: storedEnvelopeId,
          signingUrl: storedSigningUrl
        }));
      }

      // Load stored contract data if available
      if (storedContractData) {
        try {
          const parsedData = JSON.parse(storedContractData);
          setContractData(prev => ({ ...prev, ...parsedData }));
        } catch (error) {
          // Handle parsing error silently
        }
      }
    }
  }, [dealId]);

  // Save contractData to session storage whenever it changes
  useEffect(() => {
    if (dealId && contractData) {
      sessionStorage.setItem(`contractData_${dealId}`, JSON.stringify(contractData));
    }
  }, [contractData, dealId]);

  // Update URL and pass contractData as state when step changes
  const setCurrentStep = (step, data = contractData) => {
    setCurrentStepState(step);
    const params = new URLSearchParams(location.search);
    params.set('step', step);
    navigate({ search: params.toString() }, { replace: true, state: { contractData: data } });
  };




  useEffect(() => {
    // Only update state if not initial mount
    if (currentStep !== initialStep) {
      setCurrentStep(currentStep, contractData);
    }
    // eslint-disable-next-line
  }, [contractData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Keep state in sync with URL if user changes it manually
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlStep = parseInt(params.get('step')) || 0;
    if (urlStep !== currentStep) {
      setCurrentStepState(urlStep);
    }
    // eslint-disable-next-line
  }, [location.search]);

  // Handle case where user refreshes on signature step without signing URL
  useEffect(() => {
    if (currentStep === 2 && !contractData.signingUrl && !isLoading) {
      // If we're on signature step but no signing URL, try to regenerate it
      const regenerateSigningUrl = async () => {
        // First check if we have the envelopeId in session storage
        const storedEnvelopeId = sessionStorage.getItem(`envelopeId_${dealId}`);
        const storedSigningUrl = sessionStorage.getItem(`signingUrl_${dealId}`);

        if (storedSigningUrl) {
          // Use stored signing URL
          setContractData(prev => ({ ...prev, signingUrl: storedSigningUrl }));
          return;
        }

        if (!contractData.envelopeId && !storedEnvelopeId) {
          // No envelope ID, can't regenerate - user needs to go back
          return;
        }

        const envelopeIdToUse = contractData.envelopeId || storedEnvelopeId;

        setIsLoading(true);
        try {
          // Try to get the signing URL for the existing envelope
          const res = await fetch(`http://localhost:3001/api/docusign/get-signing-url/${envelopeIdToUse}?dealId=${dealId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });

          if (res.ok) {
            const data = await res.json();
            // Store in session storage for persistence
            sessionStorage.setItem(`envelopeId_${dealId}`, data.envelopeId);
            sessionStorage.setItem(`signingUrl_${dealId}`, data.url);
            setContractData(prev => ({ ...prev, envelopeId: data.envelopeId, signingUrl: data.url }));
          } else {
            // If that fails, we need to go back to step 1
          }
        } catch (error) {
          // Handle error silently
        } finally {
          setIsLoading(false);
        }
      };

      regenerateSigningUrl();
    }
  }, [currentStep, contractData.signingUrl, contractData.envelopeId, isLoading, dealId]);

  const nextStep = async () => {
    if (currentStep === 1) {
      // Generate PDF and send to backend for DocuSign
      setIsLoading(true);
      try {
        // Show loading message for PDF generation
        const doc = generateContractPDF(contractData, contractData);
        const pdfBase64 = doc.output('datauristring').split(',')[1];

        const loggedInUserEmail = user.email;
        const loggedInUserName = user.name;

        const res = await fetch("http://localhost:3001/api/docusign/create-envelope", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: "Please sign the contract",
            recipients: [{
              email: loggedInUserEmail, // Fallback to hardcoded email if not available
              name: loggedInUserName, // Fallback to hardcoded name if not available
              clientUserId: "123",
              anchorString: "/sn1/"
            }],
            documentBase64: pdfBase64,
            documentName: "Purchase-And-Sales-Agreement.pdf",
            dealId: dealId // Add the dealId to the request
          })
        });

        const data = await res.json();

        if (!res.ok) {
          // Handle specific DocuSign authentication errors
          if (data.error && data.error.includes('authentication')) {
            throw new Error("DocuSign authentication failed. Please try again or contact support.");
          } else if (data.error && data.error.includes('consent')) {
            throw new Error("DocuSign consent required. Please contact administrator.");
          } else {
            throw new Error(data.error || "Failed to initiate DocuSign");
          }
        }

        setIsLoading(false);

        // Store in session storage for persistence
        sessionStorage.setItem(`envelopeId_${dealId}`, data.envelopeId);
        sessionStorage.setItem(`signingUrl_${dealId}`, data.url);

        // Go to signature step, pass envelopeId and signing URL
        setCurrentStep(currentStep + 1, { ...contractData, envelopeId: data.envelopeId, signingUrl: data.url });
        return;
      } catch (e) {
        setIsLoading(false);

        // Show more specific error messages
        let errorMessage = e.message || "DocuSign error";
        if (errorMessage.includes("Failed to fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (errorMessage.includes("authentication")) {
          errorMessage = "DocuSign authentication failed. Please try again.";
        }

        alert(errorMessage);
        return;
      }
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1, contractData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1, contractData);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Just navigate to Deal Submission page, passing contractData and dealId
      navigate(`/submit/${dealId}`, { state: { contractData, dealId } });
    } finally {
      setIsLoading(false);
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ContractForm
            formData={contractData}
            setFormData={setContractData}
            errors={errors}
            setErrors={setErrors}
          />
        )
      case 1:
        return <ContractPreview contractData={contractData} formData={contractData} dealId={dealId} isLoading={isLoading} />
      case 2:
        // Check if signing URL is available, if not, show a message to go back
        if (!contractData.signingUrl) {
          return (
            <div className="text-center">
              <div className="bg-[var(--secondary-gray-bg)] rounded-2xl p-8 shadow-sm border border-[var(--tertiary-gray-bg)] max-w-md mx-auto">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenTool size={32} className="text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Signature Not Ready</h3>
                <p className="text-[var(--primary-gray-text)] mb-6">
                  The signing URL is not available. Please go back to the previous step and try again.
                </p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-full bg-[var(--mafia-red)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--mafia-red)]/90 transition-colors"
                >
                  Go Back to Preview
                </button>
              </div>
            </div>
          );
        }
        // Pass envelopeId and signingUrl as props
        return <SignatureStep envelopeId={contractData.envelopeId} signingUrl={contractData.signingUrl} />
      case 3:
        // Auto-download signed PDF if envelopeId is present
        return <DownloadSignedPDF envelopeId={contractData.envelopeId} contractData={contractData} />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] pt-5 pb-8 overflow-x-hidden"
    >
      <div className="w-[90%] mx-auto max-w-full">
        {/* Header */}
        <motion.div
          variants={fadeInDown}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">Contract Preparation</h1>
          </div>
          <p className="text-[var(--secondary-gray-text)]">Deal ID: #{dealId}</p>
        </motion.div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex items-center justify-between mt-8"
        >
          <motion.button
            variants={buttonHover}
            whileHover="whileHover"
            whileTap="whileTap"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]"
          >
            <ChevronLeft size={20} />
            Previous
          </motion.button>

          <motion.button
            variants={buttonHover}
            whileHover="whileHover"
            whileTap="whileTap"
            onClick={currentStep === 3 ? handleSubmit : nextStep}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--mafia-red)] text-white rounded-lg hover:bg-[var(--mafia-red)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {currentStep === 1 ? "Preparing Document..." : currentStep === 3 ? "Saving Deal..." : "Loading..."}
              </>
            ) : (
              <>
                {currentStep === 3 ? "Submit" : "Next"}
                <ChevronRight size={20} />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
function DownloadSignedPDF({ envelopeId, contractData }) {
  const hasDownloaded = useRef(false);
  const [isSendingToSeller, setIsSendingToSeller] = useState(false);
  const [sendToSellerStatus, setSendToSellerStatus] = useState(null); // 'success', 'error', null

  useEffect(() => {
    if (!envelopeId || hasDownloaded.current) return;
    hasDownloaded.current = true;
    fetch(`http://localhost:3001/api/docusign/download-signed/${envelopeId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch signed PDF');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Signed-Contract.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      })
      .catch(e => {
        // Optionally show error
        alert(e.message || 'Failed to download signed contract');
      });
  }, [envelopeId]);

  const handleSendToSeller = async () => {
    // Try multiple possible locations for seller email
    const sellerEmail = contractData?.sellerEmail || contractData?.seller?.email || contractData?.formData?.sellerEmail;

    if (!sellerEmail || !sellerEmail.trim()) {
      alert('Seller email not found in contract data. Please go back and fill in the seller email.');
      return;
    }

    if (!envelopeId) {
      alert('No envelope ID available');
      return;
    }

    setIsSendingToSeller(true);
    setSendToSellerStatus(null);

    try {
      const response = await fetch('http://localhost:3001/api/docusign/send-to-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          envelopeId: envelopeId,
          sellerEmail: sellerEmail.trim(),
          contractData: contractData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendToSellerStatus('success');
      } else {
        setSendToSellerStatus('error');
        alert(data.error || 'Failed to send contract to seller');
      }
    } catch (error) {
      setSendToSellerStatus('error');
      alert('Network error. Please try again.');
    } finally {
      setIsSendingToSeller(false);
    }
  };

  // Check if seller email exists in any form
  const hasSellerEmail = contractData?.sellerEmail || contractData?.seller?.email || contractData?.formData?.sellerEmail;

  return (
    <div className="text-center mt-12">
      <h2 className="text-xl font-bold text-white mb-4">Contract Signed!</h2>
      <p className="text-[var(--primary-gray-text)] mb-6">Your contract has been signed. The signed PDF should download automatically.</p>

      {/* Download Button */}
      <button
        className="bg-[var(--mafia-red)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--mafia-red)]/90 transition-colors mb-4"
        onClick={() => {
          if (!envelopeId) return;
          fetch(`http://localhost:3001/api/docusign/download-signed/${envelopeId}`)
            .then(res => res.blob())
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'Signed-Contract.pdf';
              document.body.appendChild(a);
              a.click();
              a.remove();
              setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            });
        }}
        disabled={!envelopeId}
      >
        Download Signed Contract
      </button>

      {/* Send to Seller Button */}
      <div className="mt-4">
        <button
          onClick={handleSendToSeller}
          disabled={!envelopeId || !hasSellerEmail || isSendingToSeller}
          className="bg-[var(--mafia-red)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--mafia-red)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSendingToSeller ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
              Sending...
            </>
          ) : (
            'Send to Seller'
          )}
        </button>

        {!hasSellerEmail && (
          <p className="text-[var(--secondary-gray-text)] text-sm mt-2">
            Seller email not found. Please go back and fill in the seller email in the form.
          </p>
        )}
      </div>

      {/* Status Messages */}
      {sendToSellerStatus === 'success' && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg max-w-md mx-auto">
          <p className="text-green-400 text-sm">Contract sent to seller successfully!</p>
        </div>
      )}

      {sendToSellerStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg max-w-md mx-auto">
          <p className="text-red-400 text-sm">Failed to send contract. Please try again.</p>
        </div>
      )}
    </div>
  );
}
