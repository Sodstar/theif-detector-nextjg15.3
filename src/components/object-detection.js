"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPredictions } from "@/utils/render-predictions";

let detectInterval;

const ObjectDetection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [detectionActive, setDetectionActive] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  async function runCoco() {
    setIsLoading(true);
    const net = await cocoSSDLoad();
    setIsLoading(false);

    detectInterval = setInterval(() => {
      if (detectionActive) {
        runObjectDetection(net);
      }
    }, 10);

    return () => clearInterval(detectInterval);
  }

  async function runObjectDetection(net) {
    if (
      canvasRef.current &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      // find detected objects
      const detectedObjects = await net.detect(
        webcamRef.current.video,
        undefined,
        confidenceThreshold
      );

      // Filter only persons
      const personObjects = detectedObjects.filter(
        (detection) =>
          detection.class === "cell phone" || detection.class === "laptop"
      );

      const context = canvasRef.current.getContext("2d");
      renderPredictions(detectedObjects, context);
    }
  }

  const showmyVideo = () => {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const myVideoWidth = webcamRef.current.video.videoWidth;
      const myVideoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = myVideoWidth;
      webcamRef.current.video.height = myVideoHeight;
    }
  };

  useEffect(() => {
    const cleanup = runCoco();
    showmyVideo();

    return () => {
      cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
      clearInterval(detectInterval);
    };
  }, [detectionActive, confidenceThreshold]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Түвшин</h2>
          <div className="flex items-center space-x-3">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={detectionActive}
                onChange={() => setDetectionActive(!detectionActive)}
              />
              <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-300">
                Идэвхтэй
              </span>
            </label>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Илрүүлэлтийн Босго/Threshold: {confidenceThreshold}
          </label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-10 shadow-lg">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Моделийн дуудаж байна түр хүлээнэ үү...
          </p>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
          {/* webcam */}
          <Webcam ref={webcamRef} className="w-full rounded-lg" muted />
          {/* canvas */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />
          {detectionActive && (
            <div className="absolute bottom-4 right-4">
              <div className="flex items-center bg-black/70 px-3 py-2 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-white text-sm font-medium">Идэвхтэй</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;
