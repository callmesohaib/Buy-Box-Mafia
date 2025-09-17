
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, propEffect } from "framer-motion";
import { useAuth } from "../store/AuthContext";
import { ChevronLeft, Upload, FileText, MapPin, User, AlertCircle, CheckCircle, X, Send, Users } from "lucide-react";
import { addDeal, updateDeal } from "../services/dealsService";
import { uploadFileToServer, deleteUploadedFile } from "../services/contractService";
import { useProperty } from "../store/PropertyContext";
import { fadeInDown, staggerContainer, staggerItem, buttonHover, modalBackdrop, modalContent } from "../animations/animation";
import Papa from "papaparse"; // 👈 add this

export default function DealSubmission() {
  const { user } = useAuth();
  const { fullAddress } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchProperty, clearProperty, propertyData } = useProperty();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPropertyData, setLocalPropertyData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [matchedBuyers, setMatchedBuyers] = useState([]);
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [buyersError, setBuyersError] = useState(null);
  const isEditing = location.state?.isEditing || false;
  const dealId = location.state?.dealId;
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;
  const MATCH_RATIO = 0.6;

  // --- Add state for CSV data
  const [csvData, setCsvData] = useState([]);

  // --- Fetch CSV like before
  useEffect(() => {
    fetch("/CompareData.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setCsvData(result.data);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching the CSV file:", error);
      });
  }, []);


  function findMatchingLocationIndex(locations, property) {
    const target = property.propertyAddress?.toLowerCase();
    if (!target) return -1;
    const targetWords = target.split(/[,\s]+/).filter(Boolean);

    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const parts = String(loc).split("/").map(p => p.trim().toLowerCase()).filter(Boolean);

      for (const part of parts) {
        const partWords = part.split(/[,\s]+/).filter(Boolean);
        if (partWords.length === 0) continue;
        let matches = 0;
        for (const word of partWords) {
          if (targetWords.includes(word)) matches++;
        }
        const matchRatio = matches / partWords.length;
        if (matchRatio >= MATCH_RATIO) return i;
      }
    }
    return -1;
  }
  const parseBudgetField = (field) => {
    if (field == null || field === "") return [];
    if (Array.isArray(field)) return field.map(v => {
      const n = Number(String(v).replace(/[^0-9.-]+/g, ''));
      return isNaN(n) ? NaN : n;
    });
    if (typeof field === 'string' && field.includes('/')) {
      return field.split('/').map(s => {
        const n = Number(s.replace(/[^0-9.-]+/g, ''));
        return isNaN(n) ? NaN : n;
      });
    }
    const n = Number(String(field).replace(/[^0-9.-]+/g, ''));
    return [isNaN(n) ? NaN : n];
  };

  const buildRangeString = (min, max) => {
    const hasMin = !isNaN(min);
    const hasMax = !isNaN(max);
    if (hasMin && hasMax) return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
    if (hasMin) return `From $${Number(min).toLocaleString()}`;
    if (hasMax) return `Up to $${Number(max).toLocaleString()}`;
    return 'N/A';
  };

  // const calculateBuyerMatch = useCallback((property, buyer) => {
  //   let score = 0, total = 0;

  //   // --- Normalize buyer zoning ---
  //   const zoning = Array.isArray(buyer.zoningTypes)
  //     ? buyer.zoningTypes
  //     : (buyer.zoningTypes ? [buyer.zoningTypes] : []);

  //   // --- Normalize buyer locations ---
  //   const rawLocations = Array.isArray(buyer.buyingLocations)
  //     ? buyer.buyingLocations
  //     : (buyer.buyingLocations ? [buyer.buyingLocations] : []);

  //   const locations = rawLocations.flatMap(loc => {
  //     if (loc && typeof loc === "object") {
  //       if (loc.label) loc = loc.label;
  //       else if (loc.name) loc = loc.name;
  //       else if (loc.value) loc = loc.value;
  //       else if (loc.location) loc = loc.location;
  //       else loc = JSON.stringify(loc);
  //     }
  //     return String(loc).split("/").map(s => s.trim()).filter(Boolean);
  //   });

  //   const pricePerValues = parseBudgetField(buyer.pricePer);

  //   // --- Match by city ---
  //   total++;
  //   if (property.propertyCity.toLowerCase() === String(buyer.city || "").toLowerCase()) score++;

  //   // --- Match by country ---
  //   total++;
  //   if (property.propertyCountry.toLowerCase() === String(buyer.country || "").toLowerCase()) score++;

  //   // --- Match by zoning ---
  //   total++;
  //   if (zoning.some(z => String(z || "").toLowerCase() === property.propertyZoning.toLowerCase())) score++;

  //   // --- Match by locations ---
  //   total++;
  //   const matchedIndex = findMatchingLocationIndex(locations, property);
  //   if (matchedIndex > -1) score++;

  //   // --- Match by price ---
  //   total++;
  //   const rawPropertyPrice = property.propertyPrice;
  //   const propertyPrice = Number(String(rawPropertyPrice).replace(/[^0-9.-]+/g, ""));

  //   let matchedRange = null;
  //   let usedIndex = -1;
  //   let isPriceMatched = false;
  //   let isFallbackPrice = false;

  //   const isValidNumber = v => typeof v === "number" && !isNaN(v);

  //   const getBuyerPrice = (index = -1) => {
  //     if (Array.isArray(pricePerValues) && pricePerValues.length > 0) {
  //       if (index >= 0 && index < pricePerValues.length && isValidNumber(pricePerValues[index])) {
  //         return pricePerValues[index];
  //       }
  //       for (let i = 0; i < pricePerValues.length; i++) {
  //         if (isValidNumber(pricePerValues[i])) {
  //           return pricePerValues[i];
  //         }
  //       }
  //     }
  //     return NaN;
  //   };

  //   const buyerPrice = getBuyerPrice(matchedIndex);
  //   const hasValidPrice = isValidNumber(buyerPrice);

  //   if (!isNaN(propertyPrice) && propertyPrice > 0) {
  //     if (hasValidPrice) {
  //       usedIndex = matchedIndex > -1 ? matchedIndex : 0;
  //       matchedRange = `$${Math.round(buyerPrice).toLocaleString()}`;

  //       // Check if property price is available and within ±1000 range
  //       if (Math.abs(propertyPrice - buyerPrice) <= 1000) {
  //         score++;
  //         isPriceMatched = true;
  //       }
  //     } else {
  //       // ✅ fallback: show 50% of property price
  //       const fiftyPercentPrice = propertyPrice * 0.5;
  //       matchedRange = `$${Math.round(fiftyPercentPrice).toLocaleString()} (50% of property price)`;
  //       isFallbackPrice = true;
  //     }
  //   } else {
  //     matchedRange = "No price data";
  //   }

  //   const percent = Math.round((score / total) * 100);
  //   return {
  //     percent,
  //     matchedRange,
  //     matchedIndex: usedIndex,
  //     isPriceMatched,
  //     isFallbackPrice
  //   };
  // }, []);


  const calculateBuyerCsvMatch = useCallback((buyer, csvRow) => {
    let score = 0, total = 0;

    // --- City
    total++;
    const buyerCity = buyer.city?.toLowerCase() || "N/A";
    const csvCity = csvRow["City name"]?.toLowerCase() || "N/A";
    const cityMatch = buyerCity === csvCity && buyerCity !== "N/A";
    if (cityMatch) score++;

    // --- Zip
    total++;
    const buyerLocations = Array.isArray(buyer.buyingLocations)
      ? buyer.buyingLocations.map(l => String(l).trim())
      : [String(buyer.buyingLocations || "").trim()];
    const csvZip = String(csvRow["Zip Code"] || "").trim();

    let matchedIndex = -1;
    buyerLocations.forEach((loc, idx) => {
      const parts = loc.split("/").map(p => p.trim());
      if (parts.includes(csvZip)) matchedIndex = idx;
    });

    const zipMatch = matchedIndex !== -1;
    if (zipMatch) score++;

    // --- PPA
    total++;
    let ppaMatch = false;
    const priceParts = String(buyer.pricePer || "").split("/").map(p => p.trim());
    const buyerPriceRaw = zipMatch ? (priceParts[matchedIndex] || "") : (priceParts[0] || "");
    const buyerPrice = parseBudgetField(buyerPriceRaw)[0];
    const csvPrice = Number(String(csvRow["PPA"]).replace(/[^0-9.-]+/g, ""));

    if (!isNaN(buyerPrice) && !isNaN(csvPrice)) {
      if (Math.abs(buyerPrice - csvPrice) <= 1000) {
        ppaMatch = true;
        score++;
      }
    }

    // --- Timeline
    total++;
    const buyerTimeline = Number(String(buyer.timeline).replace(/[^0-9.-]+/g, ""));
    const csvTimeline = Number(String(csvRow["Months of Supply"]).replace(/[^0-9.-]+/g, ""));
    const timelineMatch = !isNaN(buyerTimeline) && !isNaN(csvTimeline) && buyerTimeline === csvTimeline;
    if (timelineMatch) score++;

    const percent = Math.round((score / total) * 100);
    return {
      percent,
      city: buyer.city || "N/A",
      zip: buyer.buyingLocations || [],
      ppa: buyerPrice || "No price data",
      timeline: buyer.timeline || "N/A",
      matchedPPA: ppaMatch ? buyerPrice : "No price data"
    };
  }, []);

  const initialFormData = location.state?.contractData
    ? {
      ...location.state.contractData,
      status: location.state?.contractData?.status || "pending",
      scoutNotes: location.state?.contractData?.scoutNotes || "",
      contractFile: location.state?.contractData?.contractFile || null,
      urlAddress: decodeURIComponent(fullAddress),
      matchedBuyers: location.state?.contractData?.matchedBuyers || [],
      buyersCount: location.state?.contractData?.matchedBuyers?.length || 0,
      buyerIds: location.state?.contractData?.buyerIds || [],
      taxAssessedValue: location.state?.contractData?.taxAssessedValue ||
        propertyData?.assessment?.assessed?.assdLandValue || 'N/A',
      annualTaxes: location.state?.contractData?.annualTaxes ||
        propertyData?.assessment?.tax?.taxAmt || 'N/A',
      propertyType: location.state?.contractData?.propertyType ||
        propertyData?.summary?.propClass || 'N/A',
      propertyData: location.state?.contractData?.propertyData || {
        address: propertyData?.address,
        lot: propertyData?.lot,
        assessment: propertyData?.assessment,
        summary: propertyData?.summary
      }
    }
    : {
      status: "pending",
      scoutNotes: "",
      contractFile: null,
      matchedBuyers: [],
      buyersCount: 0,
      buyerIds: [],
      propertyType: propertyData?.summary?.propClass || 'N/A',
      propertyData: {
        address: propertyData?.address,
        lot: propertyData?.lot,
        assessment: propertyData?.assessment,
        summary: propertyData?.summary
      }
    };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingData(true);

    const fetchData = async () => {
      if (fullAddress && !location.state?.contractData) {
        try {
          const query = decodeURIComponent(fullAddress);
          const data = await fetchProperty(query);
          if (isMounted) {
            setLocalPropertyData(data);
            setFormData(prev => ({
              ...prev,
              propertyData: {
                address: data?.address,
                lot: data?.lot,
                assessment: data?.assessment,
                summary: data?.summary
              }
            }));
          }
        } catch (err) {
          console.error("Error fetching property:", err);
          if (isMounted) {
            setError("Failed to load property data");
          }
        } finally {
          if (isMounted) {
            setIsLoadingData(false);
          }
        }
      } else {
        if (isMounted) {
          setLocalPropertyData({});
          setIsLoadingData(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      clearProperty();
    };
  }, [fullAddress, location.state?.contractData]);

  useEffect(() => {
    if (isEditing && formData.matchedBuyers && formData.matchedBuyers.length > 0) return;
    if (!csvData.length) return; // 👈 wait until CSV is loaded

    const fetchAndMatchBuyers = async () => {
      setBuyersLoading(true);
      setBuyersError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/buyers`);
        if (!response.ok) throw new Error("Failed to fetch buyers");
        const buyers = await response.json();

        const matches = buyers.map(buyer => {
          let bestMatch = { percent: 0 };
          csvData.forEach(row => {
            const match = calculateBuyerCsvMatch(buyer, row);
            if (match.percent > bestMatch.percent) bestMatch = match;
          });
          return {
            ...buyer,
            matchPercent: bestMatch.percent,
            matchedCity: bestMatch.city,
            matchedZip: bestMatch.zip,
            matchedPPA: bestMatch.ppa,
            matchedTimeline: bestMatch.timeline,
          };
        })
          .filter(b => b.matchPercent > 0)
          .sort((a, b) => b.matchPercent - a.matchPercent);

        setFormData(prev => ({
          ...prev,
          matchedBuyers: matches,
          buyersCount: matches.length,
          buyerIds: matches.map(b => b.id),
        }));
      } catch (err) {
        console.error("Buyer fetch/match error:", err);
        setBuyersError(err.message);
      } finally {
        setBuyersLoading(false);
      }
    };

    fetchAndMatchBuyers();
  }, [csvData, calculateBuyerCsvMatch, isEditing]);


  useEffect(() => {
    if (location.state?.contractData) {
      setFormData(prev => ({
        ...prev,
        ...location.state.contractData,
        status: "pending",
        scoutNotes: location.state.contractData.scoutNotes || "",
        scoutName: user?.name,
        scoutEmail: user?.email,
        scoutPhone: user?.phone || "",
        Company: user?.company || "Buy Box Mafia",
        submittedBy: user?.id || user?.uid,
        urlAddress: decodeURIComponent(fullAddress),
        matchedBuyers: prev.matchedBuyers.length > 0 ? prev.matchedBuyers :
          (location.state.contractData.matchedBuyers || []),
        buyersCount: prev.matchedBuyers.length > 0 ? prev.matchedBuyers.length :
          (location.state.contractData.matchedBuyers?.length || 0),
        buyerIds: prev.matchedBuyers.length > 0 ? prev.matchedBuyers.map(b => b.id) :
          (location.state.contractData.buyerIds || []),
        taxAssessedValue: location.state.contractData.taxAssessedValue ||
          propertyData?.assessment?.assessed?.assdLandValue ||
          'N/A',
        annualTaxes: location.state.contractData.annualTaxes ||
          propertyData?.assessment?.tax?.taxAmt ||
          'N/A',
        propertyType: location.state.contractData.propertyType ||
          propertyData?.summary?.propClass ||
          'N/A',
        propertyData: prev.propertyData || location.state.contractData.propertyData || {
          address: propertyData?.address,
          lot: propertyData?.lot,
          assessment: propertyData?.assessment,
          summary: propertyData?.summary
        }
      }));
    }
  }, [location.state?.contractData, user, fullAddress, propertyData]);

  const removeFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({
      ...prev,
      contractFile: null
    }));
  };

  const statusOptions = [
    "Pending",
    "Closed",
    "Cancelled",
    "Expired"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        contractFile: null
      }));
    } else {
      alert("Please select a valid PDF file");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    let uploaded = null;

    try {
      const currentDealId = isEditing ? (formData.id || formData.dealId || dealId) : null;
      if (selectedFile) {
        const uploadResp = await uploadFileToServer(selectedFile);
        if (!uploadResp?.file) {
          throw new Error("Upload failed: no file returned");
        }
        uploaded = uploadResp.file;
        if (isEditing && formData.contractFile?.public_id) {
          try {
            await deleteUploadedFile(formData.contractFile.public_id);
          } catch (err) {
            console.warn("Failed to delete old file:", err);
          }
        }
      }

      const payload = {
        ...Object.fromEntries(
          Object.entries(formData).filter(([_, v]) => v !== undefined && v !== null)
        ),
        ...(uploaded && {
          contractFile: {
            url: uploaded.url,
            public_id: uploaded.public_id,
            original_filename: uploaded.original_filename || selectedFile?.name,
            bytes: uploaded.bytes,
            format: uploaded.format,
          }
        }),
        ...(isEditing && { id: currentDealId }),
      };

      if (isEditing && currentDealId) {
        await updateDeal(currentDealId, payload);
        setShowModal({
          show: true,
          title: "Deal Updated",
          message: "Your deal has been successfully updated!",
          isSuccess: true
        });
      } else {
        const response = await addDeal(payload);
        setShowModal({
          show: true,
          title: "Deal Created",
          message: "Your new deal has been successfully created!",
          isSuccess: true
        });
        if (response?.dealId) {
          setFormData(prev => ({ ...prev, dealId: response.dealId }));
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      if (uploaded?.public_id) {
        try {
          await deleteUploadedFile(uploaded.public_id);
        } catch (err) {
          console.warn("Cleanup failed for uploaded file:", err);
        }
      }

      setShowModal({
        show: true,
        title: "Error",
        message: error.message || "Failed to submit deal. Please try again.",
        isSuccess: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSubmit = () => {
    setShowModal(false);
    navigate("/property-search");
  };

  const contractData = location.state?.contractData || formData || {};
  const parcelData = {
    id: dealId || contractData.dealId || 'N/A',
    address: contractData.propertyAddress || contractData.address || 'N/A',
    parcelId: contractData.apn || contractData.apn || 'N/A',
    size: contractData.size || contractData.propertySize || 'N/A',
    zoning: contractData.propertyZoning || contractData.propertyZoning || 'N/A',
    currentValue: contractData.currentValue || contractData.propertyPrice || 'N/A',
    earnestMoney: contractData.earnestMoney || contractData.EarnestMoney || 'N/A',
    owner: contractData.owner || contractData.sellerName || 'N/A',
    ownerPhone: contractData.sellerPhone || 'N/A',
    ownerEmail: contractData.sellerEmail || 'N/A',
    lastContact: contractData.lastContact || 'N/A',
    propertyType: contractData.propertyType || 'N/A',
    utilities: contractData.utilities || 'N/A',
    roadAccess: contractData.roadAccess || 'N/A',
    topography: contractData.topography || 'N/A',
    floodZone: contractData.floodZone || 'N/A',
    taxAssessedValue: contractData.taxAssessedValue || 'N/A',
    annualTaxes: contractData.annualTaxes || 'N/A'
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 font-inter flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--mafia-red)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--secondary-gray-text)]">
            {location.state?.contractData ? "Loading deal..." : "Loading property data..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 font-inter flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--secondary-gray-text)] mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[var(--mafia-red)] text-white px-6 py-3 rounded-xl hover:bg-[var(--mafia-red-hover)] transition-colors"
          >
            Go Back
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
      <div className="w-[90%] mx-auto max-w-6xl">
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Deal Submission</h1>
          </div>
          <p className="text-[var(--secondary-gray-text)]">Deal ID: #{dealId}</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Parcel Summary */}
          <motion.div
            variants={staggerItem}
            className="lg:col-span-2"
          >
            <div className="bg-[var(--secondary-gray-bg)] rounded-2xl p-4 shadow-sm border border-[var(--tertiary-gray-bg)]">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <MapPin size={24} className="text-[var(--mafia-red)]" />
                Parcel Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--tertiary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Parcel ID</span>
                    <span className="text-sm font-semibold text-[var(--mafia-red)]">{parcelData.parcelId}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Address</span>
                    <span className="text-sm text-white text-right">{parcelData.address}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Size</span>
                    <span className="text-sm text-white">{parcelData.size}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Zoning</span>
                    <span className="text-sm text-white">{parcelData.zoning}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Property Type</span>
                    <span className="text-sm text-white">{parcelData.propertyType}</span>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--tertiary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Current Value</span>
                    <span className="text-sm font-semibold text-[var(--green)]">{parcelData.currentValue}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--tertiary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Earn Value</span>
                    <span className="text-sm font-semibold text-[var(--gold)]">{parcelData.earnestMoney}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Assessed Value</span>
                    <span className="text-sm text-white">{parcelData.taxAssessedValue}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Annual Taxes</span>
                    <span className="text-sm text-white">{parcelData.annualTaxes}</span>
                  </div>
                </div>
              </div>


              {/* Buyer Matching Information */}
              <div className="mt-6 pt-6 border-t border-[var(--tertiary-gray-bg)]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={20} className="text-green-500" />
                  Buyer Matching
                  {buyersLoading ? (
                    <span className="text-sm text-[var(--secondary-gray-text)] ml-2">(Loading...)</span>
                  ) : (
                    <span>({formData.matchedBuyers?.length || 0} matches)</span>
                  )}
                </h3>

                {buyersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-4 h-4 border-2 border-[var(--mafia-red)] border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm text-[var(--primary-gray-text)]">Finding matching buyers...</span>
                  </div>
                ) : buyersError ? (
                  <div className="text-sm text-red-500 py-2">{buyersError}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                      <span className="text-sm font-medium text-[var(--primary-gray-text)]">Matched Buyers</span>
                      <span className="text-sm font-semibold text-green-400">
                        {formData.matchedBuyers?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                      <span className="text-sm font-medium text-[var(--primary-gray-text)]">Top Match Score</span>
                      <span className="text-sm font-semibold text-[var(--gold)]">
                        {formData.matchedBuyers?.length > 0
                          ? `${formData.matchedBuyers[0].matchPercent}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Owner Information */}
              <div className="mt-6 pt-6 border-t border-[var(--tertiary-gray-bg)]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User size={20} className="text-[var(--mafia-red)]" />
                  Owner Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Owner</span>
                    <span className="text-sm text-white">{parcelData.owner}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Phone</span>
                    <span className="text-sm text-white">{parcelData.ownerPhone}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--primary-gray-text)]">Email</span>
                    <span className="text-sm text-white">{parcelData.ownerEmail}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="space-y-6"
          >
            {/* Status Dropdown */}
            <div className="bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]">
              <h3 className="text-lg font-semibold text-white mb-4">Deal Status</h3>
              <select
                name="status"
                value={formData.status || "pending"}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[var(--primary-gray-bg)] text-white border border-[var(--tertiary-gray-bg)] rounded-xl focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Scout Notes */}
            <div className="bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]">
              <h3 className="text-lg font-semibold text-white mb-4">Scout Notes</h3>
              <textarea
                name="scoutNotes"
                value={formData.scoutNotes}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 bg-[var(--primary-gray-bg)] text-white border border-[var(--tertiary-gray-bg)] rounded-xl focus:ring-2 focus:ring-[var(--mafia-red)] focus:border-transparent transition-all duration-200 resize-none placeholder-[var(--secondary-gray-text)]"
                placeholder="Enter your notes about this deal, including any important details, negotiations, or observations..."
              />
            </div>

            {/* Contract Upload */}
            {/* Contract Upload */}
            <div className="bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[var(--mafia-red)]" />
                Contract Upload
              </h3>

              {/* Show selected file if uploading new */}
              {selectedFile ? (
                <div className="border border-[var(--tertiary-gray-bg)] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-[var(--mafia-red)]" />
                      <div>
                        <p className="font-medium text-white">{selectedFile.name}</p>
                        <p className="text-sm text-[var(--secondary-gray-text)]">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={removeFile}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) :
                /* Show existing contract file in edit mode */
                isEditing && formData.contractFile ? (
                  <div className="border border-[var(--tertiary-gray-bg)] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={24} className="text-[var(--mafia-red)]" />
                        <div>
                          <p className="font-medium text-white">
                            {formData.contractFile.original_filename}
                          </p>
                          <p className="text-sm text-[var(--secondary-gray-text)]">
                            {(formData.contractFile.bytes / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={formData.contractFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          View
                        </a>
                        <button
                          onClick={removeFile}
                          className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Show upload area when no file selected */
                  <div className="border-2 border-dashed border-[var(--tertiary-gray-bg)] rounded-xl p-8 text-center hover:border-[var(--mafia-red)] transition-colors">
                    <Upload size={48} className="mx-auto text-[var(--primary-gray-text)] mb-4" />
                    <p className="text-[var(--primary-gray-text)] mb-2">Upload your contract PDF</p>
                    <p className="text-sm text-[var(--secondary-gray-text)] mb-4">Drag and drop or click to browse</p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <span className="inline-flex items-center px-4 py-2 bg-[var(--mafia-red)] text-white rounded-lg hover:bg-[var(--mafia-red)]/90 transition-colors">
                        Choose File
                      </span>
                    </label>
                  </div>
                )}
            </div>


            {/* Submit Button */}
            <motion.button
              variants={buttonHover}
              whileHover="whileHover"
              whileTap="whileTap"
              onClick={handleSubmit}
              disabled={isLoading || (!isEditing && !selectedFile)}
              className="w-full bg-[var(--mafia-red)] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[var(--mafia-red)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditing ? "Updating Deal..." : "Submitting Deal..."}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send size={20} />
                  {isEditing ? "Update Deal Package" : "Submit Deal Package"}
                </div>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              variants={modalContent}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-[var(--secondary-gray-bg)] rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--mafia-red)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-[var(--mafia-red)]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Deal Submitted Successfully!</h3>
                <p className="text-[var(--primary-gray-text)] mb-6">
                  Your deal package has been submitted and is now under review. You'll receive a confirmation email shortly.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-[var(--tertiary-gray-bg)] rounded-lg">
                    <CheckCircle size={20} className="text-[var(--mafia-red)]" />
                    <span className="text-sm text-[var(--mafia-red)]">Deal package submitted</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <FileText size={20} className="text-[var(--gold)]" />
                    <span className="text-sm text-[var(--gold)]">Contract uploaded</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[var(--primary-gray-bg)] rounded-lg">
                    <AlertCircle size={20} className="text-[var(--primary-gray-text)]" />
                    <span className="text-sm text-[var(--primary-gray-text)]">Pending review</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] rounded-lg hover:bg-[var(--tertiary-gray-bg)]/60 transition-colors"
                  >
                    Stay Here
                  </button>
                  <button
                    onClick={handleConfirmSubmit}
                    className="flex-1 px-4 py-2 bg-[var(--mafia-red)] text-white rounded-lg hover:bg-[var(--mafia-red)]/90 transition-colors"
                  >
                    Go to Property Search
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}