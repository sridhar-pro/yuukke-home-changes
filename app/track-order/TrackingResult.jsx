"use client";
import React from "react";
import {
  CheckCircle,
  Circle,
  XCircle,
  Clock,
  PackageCheck,
  AlertTriangle,
  Truck,
  Package,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

const TrackingResult = ({ trackingData }) => {
  const singleTrack = trackingData?.tracking_data;
  const multiWarehouse = trackingData?.data?.warehouses;

  if (!singleTrack && !multiWarehouse) {
    return (
      <p className="text-red-600 text-center py-6">
        No tracking data available.
      </p>
    );
  }

  const filterActivities = (activities) => {
    if (!activities) return [];
    const filterLabels = [
      "In Transit",
      "Booked",
      "Picked Up",
      "Not Picked",
      "Pickup Scheduled",
      "Softdata Upload",
      "Pickup Awaited",
      "Mis Route",
      "Reached At Destination",
    ];
    const seen = new Set();
    const filtered = [];

    for (let i = activities.length - 1; i >= 0; i--) {
      const act = activities[i];
      if (filterLabels.includes(act.activity)) {
        if (!seen.has(act.activity)) {
          seen.add(act.activity);
          filtered.push(act);
        }
      } else {
        filtered.push(act);
      }
    }
    return filtered;
  };

  const renderStepTracker = (activities) => {
    let filteredActivities = filterActivities(activities);

    const scrollRef = useRef(null);
    const stepRef = useRef(null);
    const [scrollIndex, setScrollIndex] = useState(0);

    useEffect(() => {
      if (stepRef.current) {
        setStepWidth(stepRef.current.offsetWidth);
      }
    }, []);

    const [stepWidth, setStepWidth] = useState(0);

    useEffect(() => {
      if (scrollRef.current && stepWidth > 0) {
        const visibleCount = Math.floor(
          scrollRef.current.clientWidth / stepWidth
        );
        const maxSteps = filteredActivities.length - visibleCount;
        setMaxIndex(maxSteps > 0 ? maxSteps : 0);
      }
    }, [stepWidth, filteredActivities.length]);

    const [maxIndex, setMaxIndex] = useState(0);

    const handleNext = () => {
      setScrollIndex((prev) => {
        const newIndex = Math.min(prev + 1, maxIndex);
        scrollRef.current.scrollTo({
          left: newIndex * stepWidth + 8, // +8px so last item isn't cropped
          behavior: "smooth",
        });
        return newIndex;
      });
    };

    const handlePrev = () => {
      setScrollIndex((prev) => {
        const newIndex = Math.max(prev - 1, 0);
        scrollRef.current.scrollTo({
          left: newIndex * stepWidth,
          behavior: "smooth",
        });
        return newIndex;
      });
    };

    const isScrollable = filteredActivities.length > 5;

    const totalSteps = filteredActivities.length;

    // Helper for last step icon
    const getLastStepIcon = (status) => {
      const s = status.toLowerCase();

      if (s.includes("not delivered")) {
        return <Clock className="w-5 h-5 text-yellow-600" />; // pending
      }
      if (s.includes("cancelled") || s.includes("canceled")) {
        return <XCircle className="w-5 h-5 text-red-600" />; // cancelled
      }
      if (s.includes("pickup not done")) {
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      }
      if (s.includes("in transit")) {
        return <Truck className="w-5 h-5 text-yellow-600" />;
      }
      if (s.includes("picked successfully")) {
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      }
      if (s.includes("reached at destination") || s.includes("delivered")) {
        return <PackageCheck className="w-5 h-5 text-green-600" />; // completed
      }
      return <Circle className="w-5 h-5" />; // default gray circle
    };

    return (
      <div className="relative px-0 py-8">
        <div
          ref={scrollRef}
          className={`relative w-full ${
            isScrollable ? "md:flex overflow-x-hidden" : "md:flex"
          } flex-col md:flex-row`}
          style={{
            scrollBehavior: "smooth",
          }}
        >
          {filteredActivities.map((act, i) => {
            const isCompleted = i < totalSteps - 1;
            const isLastStep = i === totalSteps - 1;

            return (
              <div
                key={i}
                ref={i === 0 ? stepRef : null} // only measure first one
                className={`flex md:flex-col items-center md:text-center text-left relative ${
                  isScrollable
                    ? "md:flex-none md:w-44 space-y-20 md:space-y-0"
                    : "flex-1"
                }`}
              >
                {/* Step Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isLastStep
                      ? "bg-white border-gray-300 text-gray-500"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isLastStep ? (
                    getLastStepIcon(act.activity)
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                {/* Connector */}
                {i < totalSteps - 1 && (
                  <div
                    className={`absolute md:top-4 md:left-1/2 md:h-0.5 ${
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                    style={
                      window.innerWidth < 768
                        ? {
                            width: "2px",
                            height: "100%",
                            top: "2rem",
                            left: "1rem",
                            zIndex: 0,
                          }
                        : {
                            width: "100%",
                            marginLeft: "1rem",
                            marginRight: "1rem",
                            zIndex: 0,
                          }
                    }
                  />
                )}

                {/* Activity Text */}
                <div className="md:mt-3 md:text-center ml-4 md:ml-0">
                  <p className="text-sm font-medium leading-tight">
                    {[
                      "Pickup Scheduled",
                      "Pickup Reassigned",
                      "Softdata Upload",
                      //   "Reached At Destination",
                    ].includes(act.activity)
                      ? act.activity.split(" ").map((word, idx) => (
                          <React.Fragment key={`${act.activity}-${idx}`}>
                            {word}
                            {idx < act.activity.split(" ").length - 1 && <br />}
                          </React.Fragment>
                        ))
                      : act.activity}
                  </p>

                  {/* Date & Time */}
                  {act.date && (
                    <div className="text-xs text-gray-500">
                      <p>{act.date.split(" ")[0]}</p>
                      <p>{act.date.split(" ")[1]?.split(".")[0]}</p>
                    </div>
                  )}

                  {/* Location */}
                  {act.location && (
                    <div className="text-xs text-gray-400">
                      {act.location.split(",").map((line, idx) => (
                        <p key={idx}>{line.trim()}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Button (desktop only) */}
        {isScrollable && scrollIndex < filteredActivities.length - 6 && (
          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-20"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Left Scroll Button (desktop only) */}
        {isScrollable && scrollIndex > 0 && (
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-20"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    );
  };

  const renderCard = (
    awbCode,
    activities,
    status,
    courier,
    destination,
    eta,
    warehouseName // <-- new param
  ) => (
    <div className="rounded-xl shadow-md bg-white overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-[#a00300] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          {warehouseName && (
            <span className="text-sm md:text-base font-bold tracking-wide uppercase">
              {warehouseName}
            </span>
          )}
          <span className=" text-xs md:text-sm font-medium text-gray-200">
            TRACKING: {awbCode}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-gray-50 text-sm">
        <div>
          <p className="text-gray-500 font-semibold text-xs">Status</p>
          <p className="font-bold text-gray-900">{status}</p>
        </div>
        <div>
          <p className="text-gray-500 font-semibold text-xs">Courier</p>
          <p className="text-gray-800">{courier}</p>
        </div>
        <div>
          <p className="text-gray-500 font-semibold text-xs">Destination</p>
          <p className="text-gray-800">{destination}</p>
        </div>
        <div>
          <p className="text-gray-500 font-semibold text-xs">
            ETA (Estimated Time of Arrival)
          </p>
          <p className="text-gray-800">{eta}</p>
        </div>
      </div>

      {/* Tracker */}
      <div className="p-6">{renderStepTracker(activities)}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-2">
          <Package className="w-7 h-7 text-[#a00300]" />
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-[#a00300] uppercase">
            Shipment Tracking
          </h1>
        </div>
        <p className="text-gray-600 mt-1 text-sm md:text-sm">
          Stay <span className="text-[#a00300] font-semibold">updated</span>{" "}
          with the latest status of your orders
        </p>
      </div>

      {multiWarehouse &&
        multiWarehouse.map((wh) =>
          renderCard(
            wh.awb_codes,
            wh.tracking_info.shipment_track_activities,
            wh.tracking_info.shipment_track[0]?.current_status,
            wh.tracking_info.shipment_track[0]?.courier_name,
            wh.tracking_info.shipment_track[0]?.destination,
            wh.tracking_info.etd,
            wh.warehouse_name
          )
        )}

      {singleTrack &&
        renderCard(
          singleTrack.shipment_track[0]?.awb_code,
          singleTrack.shipment_track_activities,
          singleTrack.shipment_track[0]?.current_status,
          singleTrack.shipment_track[0]?.courier_name,
          singleTrack.shipment_track[0]?.destination,
          singleTrack.etd,
          singleTrack.shipment_track[0]?.warehouse_name
        )}
    </div>
  );
};

export default TrackingResult;
