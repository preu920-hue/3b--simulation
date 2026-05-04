import { createContext, useState, useRef, useEffect } from "react";
import Papa from "papaparse";
export const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  const [showInstruction, setShowInstruction] = useState(false);
  const buttonRef = useRef(null);

  // Navigation state: 'landing' | 'sub' | 'simulation'
  const [screen, setScreen] = useState("simulation");
  const [selectedAlgo, setSelectedAlgo] = useState("LMS"); // 'LMS' | 'RLS'
  const [selectedMode, setSelectedMode] = useState("Equalization"); // 'Equalization' | 'Prediction'

  const [csvFilePath, setCsvFilePath] = useState("/ecg100.csv");
  const prevPathRef = useRef(csvFilePath);
  const [time, setTime] = useState(5);
  const [generateECG, setGenerateECG] = useState(false);
  const [algoResults, setAlgoResults] = useState(null);

  const [rawSamples, setRawSamples] = useState([]);
  const [originalFs, setOriginalFs] = useState(500);
  const [selectedChannels, setSelectedChannels] = useState(["ECG_I"]);
  const [colors, setColors] = useState(["#ff4d4d"]);

  useEffect(() => {
    Papa.parse(csvFilePath, {
      download: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data;
        if (!rows.length) return;
        const headers = (rows[0] || []).map((h) =>
          typeof h === "string" ? h.trim() : h
        );
        const timeIdx =
          headers.indexOf("time_sec") !== -1
            ? headers.indexOf("time_sec")
            : headers.indexOf("Time");
        if (timeIdx === -1) return;
        const colorsName = ["#ff4d4d","#4da6ff","#66ff66","#ffcc00","#cc66ff","#00cccc"];
        setColors(colorsName);
        const hasECG = headers.includes("ECG_I");
        const channelNames = hasECG ? ["ECG_I"] : [];
        const channelIndices = channelNames.map((ch) => headers.indexOf(ch));
        if (!channelNames.length) return;
        setSelectedChannels(channelNames);
        const t0 = parseFloat(rows?.[1]?.[timeIdx]) || 0;
        const parsed = rows.slice(1).map((row) => {
          const point = { x: (parseFloat(row?.[timeIdx]) || 0) - t0 };
          channelNames.forEach((ch, i) => {
            point[ch] = parseFloat(row?.[channelIndices[i]]) || 0;
          });
          return point;
        });
        setRawSamples(parsed);
        const dt = parsed.length > 1 ? parsed[1].x - parsed[0].x : 0.002;
        setOriginalFs(Number(dt > 0 ? 1 / dt : 500).toFixed(2));
      },
      error: (err) => console.error("CSV parse error", err),
    });
  }, [csvFilePath]);

  return (
    <SimulationContext.Provider
      value={{
        showInstruction, setShowInstruction, buttonRef,
        screen, setScreen,
        selectedAlgo, setSelectedAlgo,
        selectedMode, setSelectedMode,
        generateECG, setGenerateECG,
        csvFilePath, setCsvFilePath, prevPathRef,
        rawSamples, originalFs,
        time, setTime,
        selectedChannels, colors,
        algoResults, setAlgoResults,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
