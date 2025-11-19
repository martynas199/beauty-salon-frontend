import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setSlot,
  setBeautician as setBeauticianInState,
} from "../booking/bookingSlice";
import { useNavigate } from "react-router-dom";
import BackBar from "../../components/ui/BackBar";
import DateTimePicker from "../../components/DateTimePicker";
import { api } from "../../lib/apiClient";
import PageTransition from "../../components/ui/PageTransition";
import toast from "react-hot-toast";

export default function TimeSlots() {
  const { serviceId, variantName, beauticianId, any } = useSelector(
    (s) => s.booking
  );
  const [beautician, setBeautician] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch service and beautician details
  useEffect(() => {
    if (!serviceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create AbortController for request cancellation
    const abortController = new AbortController();
    let isCancelled = false;

    // Fetch service first to get assigned beautician
    api
      .get(`/services/${serviceId}`, {
        signal: abortController.signal, // Add cancellation signal
      })
      .then((serviceResponse) => {
        if (isCancelled) return; // Don't update state if unmounted

        setService(serviceResponse.data);

        // Determine which beautician to use
        // Note: primaryBeauticianId might be populated (object) or just an ID (string)
        const primaryBeautician = serviceResponse.data.primaryBeauticianId;
        const legacyBeautician = serviceResponse.data.beauticianId;
        const legacyBeauticianArray = serviceResponse.data.beauticianIds?.[0];

        const targetBeauticianId =
          beauticianId ||
          (typeof primaryBeautician === "object"
            ? primaryBeautician._id
            : primaryBeautician) ||
          (typeof legacyBeautician === "object"
            ? legacyBeautician._id
            : legacyBeautician) ||
          (typeof legacyBeauticianArray === "object"
            ? legacyBeauticianArray._id
            : legacyBeauticianArray);

        if (!targetBeauticianId) {
          setError("No beautician assigned to this service");
          setLoading(false);
          return;
        }

        // Fetch beautician details with cancellation FIRST
        return api.get(`/beauticians/${targetBeauticianId}`, {
          signal: abortController.signal,
        });
      })
      .then((beauticianResponse) => {
        if (isCancelled || !beauticianResponse) return;

        const beauticianData = beauticianResponse.data;

        // Store beautician ID AND inSalonPayment flag in Redux state for checkout
        dispatch(
          setBeauticianInState({ 
            beauticianId: beauticianData._id, 
            any: false,
            inSalonPayment: beauticianData.inSalonPayment || false
          })
        );

        // Convert legacy working hours to new format if needed
        if (
          (!beauticianData.workingHours ||
            beauticianData.workingHours.length === 0) &&
          beauticianData.legacyWorkingHours
        ) {
          const dayMapping = {
            mon: 1,
            tue: 2,
            wed: 3,
            thu: 4,
            fri: 5,
            sat: 6,
            sun: 0,
          };

          const convertedHours = [];
          for (const [dayKey, schedule] of Object.entries(
            beauticianData.legacyWorkingHours
          )) {
            if (schedule && schedule.start && schedule.end) {
              convertedHours.push({
                dayOfWeek: dayMapping[dayKey],
                start: schedule.start,
                end: schedule.end,
              });
            }
          }

          beauticianData.workingHours = convertedHours;
        }

        setBeautician(beauticianData);
      })
      .catch((err) => {
        // Ignore cancellation errors
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return;
        }

        if (isCancelled) return;

        console.error("Failed to load service/beautician:", err);
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load availability";
        setError(errorMsg);
        toast.error(errorMsg);
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    // Cleanup: Cancel request if component unmounts
    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [serviceId, beauticianId]);

  const handleSlotSelect = (slot) => {
    // Store the selected slot's start time
    dispatch(setSlot(slot.startISO));
    // Navigate to checkout
    navigate("/checkout");
  };

  if (!serviceId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Please select a service first.</p>
        <button
          onClick={() => navigate("/services")}
          className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          Choose Service
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <BackBar onBack={() => navigate(-1)} />

      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Select Date & Time
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Choose an available date and time for your appointment
        </p>
      </div>

      <div className="px-4 pb-8">
        {loading ? (
          <div className="text-gray-600 text-center py-12">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-36 mx-auto"></div>
            </div>
          </div>
        ) : beautician ? (
          <DateTimePicker
            beauticianId={beautician._id}
            serviceId={serviceId}
            variantName={variantName}
            salonTz="Europe/London"
            stepMin={15}
            beauticianWorkingHours={beautician.workingHours || []}
            onSelect={handleSlotSelect}
          />
        ) : (
          <div className="text-gray-600 text-center py-12">
            Unable to load availability. Please try again.
          </div>
        )}
      </div>
    </PageTransition>
  );
}
