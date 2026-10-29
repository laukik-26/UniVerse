import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  CameraOff, 
  Lock, 
  Info 
} from 'lucide-react';

export const ControlledCameraFeed: React.FC = () => {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startWebcam = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Webcam API is not supported in this browser environment.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsWebcamActive(true);
    } catch (err: any) {
      console.warn('Webcam permission denied or device not found:', err);
      setCameraError('Local webcam unavailable or permission denied. Using synthetic simulation view.');
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Camera className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Controlled Camera Proctor Station
            </h3>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              ZERO CLOUD STORAGE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Volatile in-browser frame analysis with proctor overlay boundaries. No video files or face embeddings are stored.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isWebcamActive ? (
            <button
              type="button"
              onClick={stopWebcam}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startWebcam}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Enable Local Webcam Feed</span>
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Video / Synthetic Canvas Display */}
      <div className="relative w-full max-w-2xl mx-auto aspect-video bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-800 shadow-md flex items-center justify-center">
        {/* Actual Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isWebcamActive ? 'block' : 'hidden'}`}
        />

        {/* Fallback Synthetic Simulation Canvas */}
        {!isWebcamActive && (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center animate-pulse">
              <Camera className="w-8 h-8 text-slate-600" />
            </div>
            <div className="text-center">
              <span className="font-semibold text-white text-sm block">Synthetic Exam Desk Simulator</span>
              <span className="text-xs text-slate-500 font-mono mt-1 block">
                Desk-14 (Anonymous) &bull; Session EXAM-2026-CS301
              </span>
            </div>
            <button
              type="button"
              onClick={startWebcam}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              Test with Your Webcam (Local Only)
            </button>
          </div>
        )}

        {/* Proctor Bounding Overlay Boxes */}
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded border border-emerald-500/30">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              PROCTOR MONITORING ACTIVE
            </span>
            <span>FPS: 30 &bull; RESOLUTION: 640x480</span>
          </div>

          {/* Center Permitted Face Zone */}
          <div className="self-center w-40 h-48 border-2 border-dashed border-blue-400/80 rounded-2xl flex items-start justify-center p-2">
            <span className="text-[9px] font-mono uppercase bg-blue-900/80 text-blue-200 px-1 rounded">
              Gaze Zone
            </span>
          </div>

          {/* Restricted Side Zone Overlay */}
          <div className="self-end w-32 h-24 border-2 border-rose-500/90 bg-rose-500/10 rounded flex items-center justify-center">
            <span className="text-[9px] font-mono font-bold uppercase text-rose-300 bg-rose-950/80 px-1 rounded">
              Restricted Margin
            </span>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacy Architecture Disclosure:</strong> Webcams and video buffers are executed purely client-side inside the local browser canvas. 
          No video feeds, still frames, or biometric facial templates are transmitted or stored on university servers.
        </p>
      </div>
    </div>
  );
};
