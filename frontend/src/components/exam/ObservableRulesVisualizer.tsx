import React, { useState } from 'react';
import { 
  Check, 
  AlertTriangle 
} from 'lucide-react';

export const ObservableRulesVisualizer: React.FC = () => {
  // Rule 1: Sliding Window State
  const [windowSeconds, setWindowSeconds] = useState(30);
  const [thresholdCount, setThresholdCount] = useState(3);
  const [timestamps, setTimestamps] = useState<number[]>([10, 18, 25, 95]);

  // Rule 2: Zone Geometry State (normalized coordinates 0.0 to 1.0)
  const [objectX, setObjectX] = useState(0.70);
  const [objectY, setObjectY] = useState(0.65);
  const objectW = 0.15;
  const objectH = 0.15;

  // Fixed Restricted Zone (e.g. side drawer / phone zone)
  const restrictedZone = { x1: 0.75, y1: 0.60, x2: 0.95, y2: 0.90 };

  // Rule 1 evaluation
  const sortedTs = [...timestamps].sort((a, b) => a - b);
  let maxCountInWindow = 0;
  const triggerWindows: { start: number; end: number; count: number }[] = [];

  for (let l = 0; l < sortedTs.length; l++) {
    const start = sortedTs[l];
    const end = start + windowSeconds;
    let r = l;
    while (r < sortedTs.length && sortedTs[r] <= end) r++;
    const count = r - l;
    if (count > maxCountInWindow) maxCountInWindow = count;
    if (count >= thresholdCount) {
      triggerWindows.push({ start, end, count });
    }
  }
  const isHeadTurnTriggered = maxCountInWindow >= thresholdCount;

  // Rule 2 evaluation (Intersection over Union)
  const objBox = {
    x1: objectX,
    y1: objectY,
    x2: objectX + objectW,
    y2: objectY + objectH,
  };

  const ix1 = Math.max(objBox.x1, restrictedZone.x1);
  const iy1 = Math.max(objBox.y1, restrictedZone.y1);
  const ix2 = Math.min(objBox.x2, restrictedZone.x2);
  const iy2 = Math.min(objBox.y2, restrictedZone.y2);

  const interW = Math.max(0, ix2 - ix1);
  const interH = Math.max(0, iy2 - iy1);
  const interArea = interW * interH;

  const areaObj = objectW * objectH;
  const areaRes = (restrictedZone.x2 - restrictedZone.x1) * (restrictedZone.y2 - restrictedZone.y1);
  const unionArea = areaObj + areaRes - interArea;
  const iou = unionArea > 0 ? interArea / unionArea : 0;

  const isZoneIntrusionTriggered = interArea >= 0.005;

  const handleAddTimestamp = () => {
    const last = timestamps.length > 0 ? timestamps[timestamps.length - 1] : 0;
    setTimestamps([...timestamps, last + Math.floor(Math.random() * 15) + 5]);
  };

  const handleResetTimestamps = () => {
    setTimestamps([10, 18, 25, 95]);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base">
          Predefined Observable Event Rules Testbed
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Interactive evaluation of algorithmic event-window counting and 2D Cartesian zone geometry, operating independently of video inference models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule 1: Sliding Window Temporal Clustering */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono">
                Observable Rule 1
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">
                Sliding-Window Head-Turn Cues
              </h4>
            </div>
            {isHeadTurnTriggered ? (
              <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                TRIGGERED ({maxCountInWindow} in {windowSeconds}s)
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                NORMAL ({maxCountInWindow}/{thresholdCount})
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Detects temporal frequency clusters of head excursions. Triggers when at least <strong>{thresholdCount}</strong> head yaw excursions occur within any sliding window of <strong>{windowSeconds}s</strong>.
          </p>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-slate-600">
                <label htmlFor="window-duration-slider" className="font-medium">Window Duration:</label>
                <span className="font-mono font-bold text-slate-900">{windowSeconds}s</span>
              </div>
              <input
                id="window-duration-slider"
                type="range"
                min="10"
                max="60"
                step="5"
                value={windowSeconds}
                onChange={(e) => setWindowSeconds(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-600">
                <label htmlFor="threshold-count-slider" className="font-medium">Threshold Count:</label>
                <span className="font-mono font-bold text-slate-900">{thresholdCount} turns</span>
              </div>
              <input
                id="threshold-count-slider"
                type="range"
                min="2"
                max="6"
                step="1"
                value={thresholdCount}
                onChange={(e) => setThresholdCount(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Timestamps sequence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Observed Event Timestamps (seconds):</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddTimestamp}
                  className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold"
                >
                  + Add Turn
                </button>
                <button
                  type="button"
                  onClick={handleResetTimestamps}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-[11px]"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded border border-slate-200 font-mono text-xs">
              {sortedTs.map((t, idx) => (
                <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  {t}s
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Rule 2: Geometric Zone Intrusion */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono">
                Observable Rule 2
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">
                Restricted Zone Geometry & IoU
              </h4>
            </div>
            {isZoneIntrusionTriggered ? (
              <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ZONE INTRUSION
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                PERMITTED WORKSPACE
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Cartesian boundary test. Calculates intersection area and IoU when a detected hand/object enters a proctor-designated restricted boundary zone.
          </p>

          {/* Interactive Visual Canvas */}
          <div className="relative w-full h-44 bg-slate-100 border border-slate-300 rounded-lg overflow-hidden flex items-center justify-center">
            {/* Permitted Desk boundary */}
            <div className="absolute inset-4 border-2 border-dashed border-slate-400/80 rounded flex items-start p-1.5 pointer-events-none">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Permitted Desk Area</span>
            </div>

            {/* Restricted Zone Box */}
            <div
              className="absolute bg-rose-500/20 border-2 border-rose-500 rounded flex items-center justify-center pointer-events-none"
              style={{
                left: `${restrictedZone.x1 * 100}%`,
                top: `${restrictedZone.y1 * 100}%`,
                width: `${(restrictedZone.x2 - restrictedZone.x1) * 100}%`,
                height: `${(restrictedZone.y2 - restrictedZone.y1) * 100}%`,
              }}
            >
              <span className="text-[9px] font-mono font-bold text-rose-800 uppercase px-1">Restricted Zone</span>
            </div>

            {/* Detected Object Box */}
            <div
              className={`absolute transition-all duration-100 border-2 rounded flex items-center justify-center ${
                isZoneIntrusionTriggered ? 'bg-amber-500/40 border-amber-600' : 'bg-blue-500/30 border-blue-600'
              }`}
              style={{
                left: `${objectX * 100}%`,
                top: `${objectY * 100}%`,
                width: `${objectW * 100}%`,
                height: `${objectH * 100}%`,
              }}
            >
              <span className="text-[9px] font-mono font-bold text-slate-900 px-1">Object/Hand</span>
            </div>
          </div>

          {/* Controls to move object */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-slate-600">
                <label htmlFor="object-pos-x-slider" className="font-medium">Object X Position:</label>
                <span className="font-mono font-bold text-slate-900">{objectX.toFixed(2)}</span>
              </div>
              <input
                id="object-pos-x-slider"
                type="range"
                min="0.1"
                max="0.8"
                step="0.02"
                value={objectX}
                onChange={(e) => setObjectX(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-600">
                <label htmlFor="object-pos-y-slider" className="font-medium">Object Y Position:</label>
                <span className="font-mono font-bold text-slate-900">{objectY.toFixed(2)}</span>
              </div>
              <input
                id="object-pos-y-slider"
                type="range"
                min="0.1"
                max="0.8"
                step="0.02"
                value={objectY}
                onChange={(e) => setObjectY(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
            <span>Intersection Area: <strong>{interArea.toFixed(4)}</strong></span>
            <span>IoU: <strong>{iou.toFixed(4)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
