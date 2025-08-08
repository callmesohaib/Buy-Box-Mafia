import { useState, useEffect, useRef, useCallback } from "react"
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
  const { fullAddress } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { propertyData, clearProperty, updateProperty } = useProperty();

  const query = new URLSearchParams(location.search);
  const initialStep = parseInt(query.get('step')) || 0;
  const [currentStep, setCurrentStepState] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const defaultDropdowns = {
    financingType: "Cash",
    surveyRequired: "Yes",
    titleInsurance: "Yes",
    inspectionPeriod: "7 days",
  };

  const attomKey = import.meta.env.VITE_ATTOM_API_KEY;
  const attomUrl = import.meta.env.VITE_ATTOM_API_URL;

  const fetchProperty = useCallback(async () => {
    if (!fullAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const query = decodeURIComponent(fullAddress);
      const apiUrl = `${attomUrl}?address1=${encodeURIComponent(query)}`;

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
        setError("No property found");
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      setError("Failed to fetch property");
    } finally {
      setIsLoading(false);
    }
  }, [fullAddress, attomUrl, attomKey, updateProperty, clearProperty]);

  useEffect(() => {
    if (!propertyData) {
      fetchProperty();
    }
  }, [propertyData, fetchProperty]);

  const dealId = propertyData?.identifier?.attomId || '';

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
    const storedEnvelopeId = sessionStorage.getItem(`envelopeId_${fullAddress}`);
    const storedSigningUrl = sessionStorage.getItem(`signingUrl_${fullAddress}`);
    const storedContractData = sessionStorage.getItem(`contractData_${fullAddress}`);

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
  }, [fullAddress]);

  useEffect(() => {
    if (contractData) {
      sessionStorage.setItem(`contractData_${fullAddress}`, JSON.stringify(contractData));
    }
  }, [contractData, fullAddress]);

  const setCurrentStep = (step, data = contractData) => {
    setCurrentStepState(step);
    const params = new URLSearchParams(location.search);
    params.set('step', step);
    navigate({
      pathname: `/contract/${encodeURIComponent(fullAddress)}`,
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
        const storedEnvelopeId = sessionStorage.getItem(`envelopeId_${fullAddress}`);
        const storedSigningUrl = sessionStorage.getItem(`signingUrl_${fullAddress}`);

        if (storedSigningUrl) {
          setContractData(prev => ({ ...prev, signingUrl: storedSigningUrl }));
          return;
        }

        const envelopeIdToUse = contractData.envelopeId || storedEnvelopeId;
        if (!envelopeIdToUse) return;

        setIsLoading(true);
        try {
          const res = await fetch(`http://localhost:3001/api/docusign/get-signing-url/${envelopeIdToUse}?fullAddress=${encodeURIComponent(fullAddress)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });

          if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem(`envelopeId_${fullAddress}`, data.envelopeId);
            sessionStorage.setItem(`signingUrl_${fullAddress}`, data.url);
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
  }, [currentStep, contractData.signingUrl, contractData.envelopeId, isLoading, fullAddress]);

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
            fullAddress: encodeURIComponent(fullAddress),
            dealId
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to initiate DocuSign");
        }

        const data = await res.json();
        sessionStorage.setItem(`envelopeId_${fullAddress}`, data.envelopeId);
        sessionStorage.setItem(`signingUrl_${fullAddress}`, data.url);

        setCurrentStep(currentStep + 1, {
          ...contractData,
          ...formData,
          envelopeId: data.envelopeId,
          signingUrl: data.url,
          matchedBuyers: contractData.matchedBuyers || [],
          buyersCount: contractData.matchedBuyers.length || 0,
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
      navigate(`/submit/${encodeURIComponent(fullAddress)}`, {
        state: {
          contractData: {
            ...contractData,
            ...formData,
            matchedBuyers: contractData.matchedBuyers || [],
            buyersCount: contractData.matchedBuyers.length || 0,
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
            fullAddress={fullAddress}
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
            fullAddress={fullAddress}
          />
        );
      case 3:
        return (
          <DownloadSignedPDF
            envelopeId={contractData.envelopeId}
            contractData={contractData}
            fullAddress={fullAddress}
          />
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 font-inter flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--secondary-gray-text)] mb-4">{error}</p>
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
          <p className="text-[var(--secondary-gray-text)]">Property: {decodeURIComponent(fullAddress)}</p>
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

function DownloadSignedPDF({ envelopeId, contractData, fullAddress }) {
  const [isSendingToSeller, setIsSendingToSeller] = useState(false);
  const [sendToSellerStatus, setSendToSellerStatus] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!envelopeId) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/docusign/download-signed/${envelopeId}`);
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
      const response = await fetch('http://localhost:3001/api/docusign/send-to-seller', {
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

  const checkStatus = async () => {
    if (!sellerEnvelopeId) return;
    setIsChecking(true);
    try {
      const response = await fetch(`http://localhost:3001/api/docusign/seller-envelope-status/${sellerEnvelopeId}?fullAddress=${encodeURIComponent(fullAddress)}`);
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
      const response = await fetch(`http://localhost:3001/api/docusign/download-seller-signed/${sellerEnvelopeId}?fullAddress=${encodeURIComponent(fullAddress)}`);
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