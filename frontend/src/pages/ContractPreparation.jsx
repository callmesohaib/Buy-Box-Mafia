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
import { useAuth } from "../store/AuthContext"
import { useProperty } from "../store/PropertyContext"

export default function ContractPreparation() {
  const { address1, address2 } = useParams();
  const { propertyData, clearProperty, updateProperty } = useProperty()
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const query = new URLSearchParams(location.search);
  const initialStep = parseInt(query.get('step')) || 0;
  const [currentStep, setCurrentStepState] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [buyersError, setBuyersError] = useState(null);
  const defaultDropdowns = {
    financingType: "Cash",
    surveyRequired: "Yes",
    titleInsurance: "Yes",
    inspectionPeriod: "7 days",
  };
  const attomKey = import.meta.env.VITE_ATTOM_API_KEY;
  const attomUrl = import.meta.env.VITE_ATTOM_API_URL;

  async function fetchProperty() {
    setIsLoading(true);
    try {
      const apiUrl = `${attomUrl}?address1=${encodeURIComponent(address1)}${address2 ? `&address2=${encodeURIComponent(address2)}` : ''}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'apikey': attomKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.property && data.property.length > 0) {
        updateProperty(data.property[0]);
      } else {
        clearProperty();
        setBuyersError("No property found");
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      setBuyersError("Failed to fetch property");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!propertyData) {
      fetchProperty();
    }
  }, []);
  console.log("ContractPreparation:", { propertyData });
  const initialContractData = (location.state && location.state.contractData)
    ? { ...defaultDropdowns, ...location.state.contractData }
    : { ...defaultDropdowns };

  const buyerData = location.state || {};
  const [contractData, setContractData] = useState({
    ...initialContractData,
    matchedBuyers: buyerData.matchedBuyers || [],
    buyersCount: buyerData.buyersCount || 0,
    buyerIds: buyerData.buyerIds || [],
  });

  const [formData, setFormData] = useState({
    ...initialContractData,
    matchedBuyers: buyerData.matchedBuyers || [],
    buyersCount: buyerData.buyersCount || 0,
    buyerIds: buyerData.buyerIds || [],
  });

  const [errors, setErrors] = useState({});

  const handleFormChange = (newFormData) => {
    setFormData(prev => ({
      ...prev,
      ...newFormData
    }));
  };
  var dealId = propertyData.identifier.attomId
  useEffect(() => {

    if (propertyData) {
      const updatedData = {
        apn: propertyData?.identifier.apn || '',
        propertyAddress: propertyData?.address.oneLine,
        dealId: propertyData.identifier.attomId,
        propertyCountry: propertyData?.address?.country || '',
        propertyCity: propertyData?.address?.locality || '',
        propertyState: propertyData?.address?.matchCode || '',
        propertyPrice: propertyData.sale?.amount?.saleAmt || '',
        propertyType: propertyData.summary?.propClass || '',
        propertyZoning: propertyData.lot?.zoningType || '',
        listPrice: propertyData.sale?.amount?.listPrice || '',
        listDate: propertyData.sale?.amount?.saleRecDate || '',
        scoutName: user?.name || '',
        scoutEmail: user?.email || '',
        sellerName: propertyData?.sale?.sellerName || '',
        propertySize: propertyData.building?.size.bldgSize || '',
      };

      setContractData(prev => ({
        ...prev,
        ...updatedData
      }));

      setFormData(prev => ({
        ...prev,
        ...updatedData
      }));
    }
  }, [propertyData, user]);

  useEffect(() => {
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

    if (storedContractData) {
      try {
        const parsedData = JSON.parse(storedContractData);
        setContractData(prev => ({
          ...prev,
          ...parsedData,
          matchedBuyers: parsedData.matchedBuyers || prev.matchedBuyers || [],
          buyersCount: parsedData.buyersCount || prev.buyersCount || 0,
          buyerIds: parsedData.buyerIds || prev.buyerIds || []
        }));
      } catch (error) {
        console.error("Error parsing stored contract data:", error);
      }
    }
  }, [dealId]);

  useEffect(() => {
    if (contractData) {
      sessionStorage.setItem(`contractData_${dealId}`, JSON.stringify(contractData));
    }
  }, [contractData, dealId]);

  const setCurrentStep = (step, data = contractData) => {
    setCurrentStepState(step);
    const params = new URLSearchParams(location.search);
    params.set('step', step);
    navigate({
      search: params.toString()
    }, {
      replace: true,
      state: {
        contractData: {
          ...data,
          matchedBuyers: data.matchedBuyers || contractData.matchedBuyers || [],
          buyersCount: data.buyersCount || contractData.buyersCount || 0,
          buyerIds: data.buyerIds || contractData.buyerIds || [],
          dealId
        }
      }
    });
  };

  useEffect(() => {
    if (currentStep === 2 && !contractData.signingUrl && !isLoading) {
      const regenerateSigningUrl = async () => {
        const storedEnvelopeId = sessionStorage.getItem(`envelopeId_${dealId}`);
        const storedSigningUrl = sessionStorage.getItem(`signingUrl_${dealId}`);

        if (storedSigningUrl) {
          setContractData(prev => ({ ...prev, signingUrl: storedSigningUrl }));
          return;
        }

        const envelopeIdToUse = contractData.envelopeId || storedEnvelopeId;
        if (!envelopeIdToUse) return;

        setIsLoading(true);
        try {
          const res = await fetch(`http://localhost:3001/api/docusign/get-signing-url/${envelopeIdToUse}?dealId=${dealId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });

          if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem(`envelopeId_${dealId}`, data.envelopeId);
            sessionStorage.setItem(`signingUrl_${dealId}`, data.url);
            setContractData(prev => ({
              ...prev,
              envelopeId: data.envelopeId,
              signingUrl: data.url
            }));
          } else {
            setCurrentStep(1);
          }
        } catch (error) {
          console.error("Error regenerating signing URL:", error);
        } finally {
          setIsLoading(false);
        }
      };

      regenerateSigningUrl();
    }
  }, [currentStep, contractData.signingUrl, contractData.envelopeId, isLoading, dealId]);

  const nextStep = async () => {
    if (currentStep === 0) {
      setContractData(prev => ({
        ...prev,
        ...formData
      }));
    }

    if (currentStep === 1) {
      setIsLoading(true);
      try {
        const doc = generateContractPDF(contractData, formData);
        const pdfBase64 = doc.output('datauristring').split(',')[1];

        const res = await fetch("http://localhost:3001/api/docusign/create-envelope", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: "Please sign the contract",
            recipients: [{
              email: user?.email || "user@example.com",
              name: user?.name || "User Name",
              clientUserId: "123",
              anchorString: "/sn1/"
            }],
            documentBase64: pdfBase64,
            documentName: "Purchase-And-Sales-Agreement.pdf",
            dealId
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to initiate DocuSign");
        }

        const data = await res.json();
        sessionStorage.setItem(`envelopeId_${dealId}`, data.envelopeId);
        sessionStorage.setItem(`signingUrl_${dealId}`, data.url);

        setCurrentStep(currentStep + 1, {
          ...contractData,
          ...formData,
          envelopeId: data.envelopeId,
          signingUrl: data.url,
          matchedBuyers: contractData.matchedBuyers || [],
          buyersCount: contractData.buyersCount || 0,
          buyerIds: contractData.buyerIds || []
        });
      } catch (e) {
        console.error("DocuSign error:", e);
        alert(e.message || "Failed to prepare document. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1, {
        ...contractData,
        ...formData
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1, {
        ...contractData,
        ...formData
      });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      navigate(`/submit/${dealId}`, {
        state: {
          contractData: {
            ...contractData,
            ...formData,
            matchedBuyers: contractData.matchedBuyers || [],
            buyersCount: contractData.buyersCount || 0,
            buyerIds: contractData.buyerIds || []
          },
          dealId
        }
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ContractForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 1:
        return (
          <ContractPreview
            contractData={contractData}
            formData={contractData}
            dealId={dealId}
            isLoading={isLoading}
          />
        );
      case 2:
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
        return (
          <SignatureStep
            envelopeId={contractData.envelopeId}
            signingUrl={contractData.signingUrl}
          />
        );
      case 3:
        return (
          <DownloadSignedPDF
            envelopeId={contractData.envelopeId}
            contractData={contractData}
          />
        );
      default:
        return null;
    }
  };

  if (buyersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 font-inter flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--secondary-gray-text)] mb-4">{buyersError}</p>
          <button
            onClick={() => navigate('/property-search')}
            className="bg-[var(--mafia-red)] text-white px-6 py-3 rounded-xl hover:bg-[var(--mafia-red-hover)] transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] pt-5 pb-8 overflow-x-hidden"
    >
      <div className="w-[90%] mx-auto max-w-full">
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

        <ProgressSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />

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
  );
}

function DownloadSignedPDF({ envelopeId, contractData }) {
  const hasDownloaded = useRef(false);
  const [isSendingToSeller, setIsSendingToSeller] = useState(false);
  const [sendToSellerStatus, setSendToSellerStatus] = useState(null);

  useEffect(() => {
    if (!envelopeId || hasDownloaded.current) return;
    hasDownloaded.current = true;

    const downloadPdf = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/docusign/download-signed/${envelopeId}`);
        if (!response.ok) throw new Error('Failed to fetch signed PDF');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Signed-Contract.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } catch (e) {
        console.error("Download error:", e);
      }
    };

    downloadPdf();
  }, [envelopeId]);

  const handleSendToSeller = async () => {
    const sellerEmail = contractData?.sellerEmail || contractData?.seller?.email || contractData?.formData?.sellerEmail;
    const sellerName = contractData?.sellerName || contractData?.seller?.name || contractData?.formData?.sellerName;

    if (!sellerEmail?.trim()) {
      alert('Seller email is required');
      return;
    }

    if (!sellerName?.trim()) {
      alert('Seller name is required');
      return;
    }

    setIsSendingToSeller(true);
    setSendToSellerStatus(null);

    try {
      const response = await fetch('http://localhost:3001/api/docusign/send-to-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          envelopeId,
          sellerEmail: sellerEmail.trim(),
          sellerName: sellerName.trim(),
          contractData
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send');

      setSendToSellerStatus('success');
      if (data.sellerEnvelopeId) {
        sessionStorage.setItem(`sellerEnvelopeId_${contractData?.dealId || 'default'}`, data.sellerEnvelopeId);
      }
    } catch (error) {
      console.error("Send to seller error:", error);
      setSendToSellerStatus('error');
      alert(error.message || 'Failed to send contract to seller');
    } finally {
      setIsSendingToSeller(false);
    }
  };

  const hasSellerInfo = contractData?.sellerEmail || contractData?.seller?.email ||
    contractData?.formData?.sellerEmail;

  return (
    <div className="text-center mt-12">
      <h2 className="text-xl font-bold text-white mb-4">Contract Signed!</h2>
      <p className="text-[var(--primary-gray-text)] mb-6">Your contract has been signed.</p>

      <button
        className="bg-[var(--mafia-red)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--mafia-red)]/90 transition-colors mb-4"
        onClick={() => {
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

      <div className="mt-4">
        <button
          onClick={handleSendToSeller}
          disabled={!envelopeId || !hasSellerInfo || isSendingToSeller}
          className="bg-[var(--mafia-red)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--mafia-red)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSendingToSeller ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
              Sending to Seller...
            </>
          ) : (
            '📧 Send to Seller for Signature'
          )}
        </button>

        {!hasSellerInfo && (
          <p className="text-[var(--secondary-gray-text)] text-sm mt-2">
            Seller information not found. Please go back and fill in the seller details.
          </p>
        )}
      </div>

      {sendToSellerStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-green-400 font-semibold">Contract Sent Successfully!</p>
          </div>
          <SellerSigningStatus
            sellerEnvelopeId={sessionStorage.getItem(`sellerEnvelopeId_${contractData?.dealId || 'default'}`)}
            dealId={contractData?.dealId}
          />
        </div>
      )}

      {sendToSellerStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg max-w-md mx-auto">
          <p className="text-red-400 font-semibold">Failed to Send Contract</p>
          <p className="text-red-400 text-sm mt-1">Please try again or contact support.</p>
        </div>
      )}
    </div>
  );
}

function SellerSigningStatus({ sellerEnvelopeId, dealId }) {
  const [status, setStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const checkStatus = async () => {
    if (!sellerEnvelopeId) return;

    setIsChecking(true);
    try {
      const response = await fetch(`http://localhost:3001/api/docusign/seller-envelope-status/${sellerEnvelopeId}`);
      const data = await response.json();

      if (response.ok) {
        setStatus(data);
      } else {
        console.error('Status check failed:', data.error);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const downloadFullySigned = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/docusign/download-seller-signed/${sellerEnvelopeId}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Fully-Signed-Contract.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } else {
        throw new Error('Failed to download');
      }
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
  }, [sellerEnvelopeId]);

  if (!sellerEnvelopeId) return null;

  return (
    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-blue-400 font-semibold text-sm">Seller Signing Status</h4>
        <button
          onClick={checkStatus}
          disabled={isChecking}
          className="text-blue-400 hover:text-blue-300 text-xs disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {status ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status.completed ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
            <span className="text-blue-400 text-sm">
              {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
            </span>
          </div>

          {status.completed ? (
            <div className="space-y-2">
              <p className="text-green-400 text-sm">✅ Seller has signed!</p>
              <button
                onClick={downloadFullySigned}
                disabled={isDownloading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  '📄 Download Fully Signed Contract'
                )}
              </button>
            </div>
          ) : (
            <p className="text-yellow-400 text-sm">⏳ Waiting for seller...</p>
          )}
        </div>
      ) : (
        <p className="text-blue-400 text-sm">Checking status...</p>
      )}
    </div>
  );
}