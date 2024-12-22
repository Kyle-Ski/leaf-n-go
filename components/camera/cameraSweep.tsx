"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs"; // This pulls in the main TensorFlow.js library
import { Button } from "@/components/ui/button"; // shadcn UI button, adjust as needed

interface CameraScannerProps {
  /** For example, you might pass a list of known item names from the checklist */
  knownItems: string[];
  onItemsDetected: (detectedItems: string[]) => void;
}

export function CameraScanner({ knownItems, onItemsDetected }: CameraScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);

  // Camera & detection states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  const [otherDetectedItems, setOtherDetectedItems] = useState<string[]>([]);

  // 1. Load the COCO-SSD model once
  useEffect(() => {
    let isMounted = true;
    cocoSsd.load().then((loadedModel) => {
      if (isMounted) {
        setModel(loadedModel);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Start/Stop camera
  const handleStartCamera = () => {
    setIsCameraActive(true);
    // Optionally clear out old detection results
    setDetectedItems([]);
    setOtherDetectedItems([]);
  };

  const handleStopCamera = () => {
    setIsCameraActive(false);
  };

  // 3. Capture the current frame and run detection
  const captureAndDetect = useCallback(async () => {
    if (!isCameraActive) return; // Only detect if camera is active

    if (webcamRef.current && model) {
      const video = webcamRef.current.video as HTMLVideoElement;
      if (video.readyState === 4) {
        const predictions = await model.detect(video);

        const recognized: string[] = [];
        const allOtherItems: string[] = [];

        predictions.forEach((prediction) => {
          const itemName = prediction.class.toLowerCase();
          console.log("ITEM PREDICTION:", itemName);

          // Check if it’s a known item from the user’s checklist
          if (knownItems.includes(itemName)) {
            recognized.push(itemName);
          } else {
            allOtherItems.push(itemName);
          }
        });

        if (recognized.length > 0) {
          setDetectedItems((prev) => {
            // Combine newly recognized items with existing
            const unique = Array.from(new Set([...prev, ...recognized]));
            return unique;
          });
        }
        if (allOtherItems.length > 0) {
          setOtherDetectedItems((prev) => {
            const unique = Array.from(new Set([...prev, ...allOtherItems]));
            return unique;
          });
        }
      }
    }
  }, [isCameraActive, model, knownItems]);

  // 4. Auto-run detection every 2 seconds, but only if the camera is active
  useEffect(() => {
    let interval = null;
    if (isCameraActive) {
      interval = setInterval(() => {
        captureAndDetect();
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCameraActive, captureAndDetect]);

  // 5. Whenever `detectedItems` changes, call the parent
  useEffect(() => {
    onItemsDetected(detectedItems);
  }, [detectedItems, onItemsDetected]);

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="flex space-x-2">
        <Button
          variant="default"
          onClick={handleStartCamera}
          disabled={isCameraActive}
        >
          Start Camera
        </Button>
        <Button
          variant="destructive"
          onClick={handleStopCamera}
          disabled={!isCameraActive}
        >
          Stop Camera
        </Button>
      </div>

      {/* Only render the Webcam component if the camera is active */}
      {isCameraActive && (
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "environment", // or "user" for the front camera
          }}
          className="rounded shadow-md mt-2"
        />
      )}

      {/* Display lists of detected items */}
      <div className="mt-2 text-sm text-gray-700">
        <p>
          <strong>Detected checklist items:</strong>{" "}
          {detectedItems.length > 0 ? detectedItems.join(", ") : "None"}
        </p>
        <p>
          <strong>Other detected items:</strong>{" "}
          {otherDetectedItems.length > 0 ? otherDetectedItems.join(", ") : "None"}
        </p>
      </div>
    </div>
  );
}
