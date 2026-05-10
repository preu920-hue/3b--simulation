import { useContext, useState, useEffect, useRef } from "react";
import { SimulationContext } from "../../context/SimulationContext";
import styles from "./rightPanel.module.css";
import Swal from "sweetalert2";
import {
  runLMS_Equalization,
  runLMS_Prediction,
  runRLS_Equalization,
  runRLS_Prediction,
  buildDeterministicSeed,
} from "../../utils/algorithms";

export const RightPanel = () => {
  const {
    time, setTime,
    setGenerateECG, generateECG,
    originalFs,
    csvFilePath, setCsvFilePath, prevPathRef,
    selectedAlgo, selectedMode,
    setAlgoResults,
    setSelectedMode, setSelectedAlgo,
  } = useContext(SimulationContext);

  // LMS params
  const [lmsM, setLmsM] = useState(5);
  const [lmsMu, setLmsMu] = useState(0.01);
  const [lmsN, setLmsN] = useState(500);
  const [lmsP, setLmsP] = useState(4);

  // RLS params
  const [rlsM, setRlsM] = useState(5);
  const [rlsLambda, setRlsLambda] = useState(0.99);
  const [rlsDelta, setRlsDelta] = useState(0.1);
  const [rlsN, setRlsN] = useState(500);
  const [rlsP, setRlsP] = useState(4);
  const lastRunRef = useRef({ key: "", payload: null });

  useEffect(() => {
    if (prevPathRef.current !== csvFilePath) {
      setAlgoResults(null);
      prevPathRef.current = csvFilePath;
    }
  }, [csvFilePath, prevPathRef, setAlgoResults]);

  const handleAlgoChange = (e) => {
    const algo = String(e.target.value);
    setAlgoResults(null);
    setSelectedAlgo(algo);
  };

  const handleModeChange = (e) => {
    const mode = String(e.target.value);
    setAlgoResults(null);
    setSelectedMode(mode);
  };

  const runAlgorithm = () => {
    if (!generateECG) {
      Swal.fire({ icon: "info", title: "Oops...", text: "Please generate ECG signal first!" });
      return;
    }
    const runConfig = {
      selectedAlgo,
      selectedMode,
      lmsM,
      lmsMu,
      lmsN,
      lmsP,
      rlsM,
      rlsLambda,
      rlsDelta,
      rlsN,
      rlsP,
    };
    const runKey = JSON.stringify(runConfig);
    if (lastRunRef.current.key === runKey && lastRunRef.current.payload) {
      setAlgoResults(lastRunRef.current.payload);
      return;
    }
    const runSeed = buildDeterministicSeed(runConfig);
    let results;
    let payload = null;
    if (selectedAlgo === "LMS" && selectedMode === "Equalization") {
      results = runLMS_Equalization(lmsN, lmsM, lmsMu, runSeed);
      payload = { type: "LMS_EQ", label: "LMS Equalization", data: results };
    } else if (selectedAlgo === "LMS" && selectedMode === "Prediction") {
      results = runLMS_Prediction(lmsN, lmsP, lmsMu, runSeed);
      payload = { type: "LMS_PRED", label: "LMS Prediction", data: results };
    } else if (selectedAlgo === "RLS" && selectedMode === "Equalization") {
      results = runRLS_Equalization(rlsN, rlsM, rlsLambda, rlsDelta, runSeed);
      payload = { type: "RLS_EQ", label: "RLS Equalization", data: results };
    } else if (selectedAlgo === "RLS" && selectedMode === "Prediction") {
      results = runRLS_Prediction(rlsN, rlsP, rlsLambda, rlsDelta, runSeed);
      payload = { type: "RLS_PRED", label: "RLS Prediction", data: results };
    }
    if (payload) {
      lastRunRef.current = { key: runKey, payload };
      setAlgoResults(payload);
    }
  };

  return (
    <div className={styles.rightPanelContainer}>
      <div className={styles.right}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", background: "#E1F5EE", color: "#0F6E56", borderRadius: "6px", padding: "2px 10px", fontWeight: 500 }}>
            {selectedAlgo} — {selectedMode}
          </span>
        </div>

        <h2>ECG Signal &amp; Filter Controls</h2>

        {/* Signal Setup */}
        <div className={styles.box}>
          <h3>Signal Setup</h3>
          <label>Select ECG Dataset</label>
          <select value={csvFilePath} onChange={(e) => setCsvFilePath(e.target.value)}>
            <option value="/ecg100.csv">ECG Dataset 1 (ecg100)</option>
            <option value="/ecg200.csv">ECG Dataset 2 (ecg200)</option>
            <option value="/ecg300.csv">ECG Dataset 3 (ecg300)</option>
          </select>
          <label>Duration: <span>{time} seconds</span></label>
          <input type="range" min="1" max="70" value={time} onChange={(e) => setTime(Number(e.target.value))} />
          <label>Sampling Rate: <span>{originalFs} Hz</span></label>
          <button onClick={() => setGenerateECG(true)}>Generate ECG Signal</button>
        </div>

        {/* Algorithm Setup */}
        <div className={styles.box}>
          <h3>Algorithm Setup</h3>
          <label>Algorithm</label>
          <select value={selectedAlgo || ""} onChange={handleAlgoChange}>
            <option value="LMS">LMS</option>
            <option value="RLS">RLS</option>
          </select>

          <label style={{ marginTop: "8px" }}>Task</label>
          <select value={selectedMode || ""} onChange={handleModeChange}>
            <option value="Equalization">Equalization</option>
            <option value="Prediction">Prediction</option>
          </select>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>

            {/* LMS Equalization */}
            {selectedAlgo === "LMS" && selectedMode === "Equalization" && (<>
              <label>Filter order (M): {lmsM}</label>
              <input type="range" min="1" max="20" step="1" value={lmsM} onChange={e => setLmsM(Number(e.target.value))} />
              <label>Step size (mu): {lmsMu}</label>
              <input type="range" min="0.001" max="0.5" step="0.001" value={lmsMu} onChange={e => setLmsMu(Number(e.target.value))} />
              <label>Number of samples (N): {lmsN}</label>
              <input type="range" min="100" max="2000" step="10" value={lmsN} onChange={e => setLmsN(Number(e.target.value))} />
            </>)}

            {/* LMS Prediction */}
            {selectedAlgo === "LMS" && selectedMode === "Prediction" && (<>
              <label>Predictor order (P): {lmsP}</label>
              <input type="range" min="1" max="20" step="1" value={lmsP} onChange={e => setLmsP(Number(e.target.value))} />
              <label>Step size (mu): {lmsMu}</label>
              <input type="range" min="0.001" max="0.2" step="0.001" value={lmsMu} onChange={e => setLmsMu(Number(e.target.value))} />
              <label>Number of samples (N): {lmsN}</label>
              <input type="range" min="100" max="2000" step="10" value={lmsN} onChange={e => setLmsN(Number(e.target.value))} />
            </>)}

            {/* RLS Equalization */}
            {selectedAlgo === "RLS" && selectedMode === "Equalization" && (<>
              <label>Filter order (M): {rlsM}</label>
              <input type="range" min="1" max="20" step="1" value={rlsM} onChange={e => setRlsM(Number(e.target.value))} />
              <label>Forgetting factor (lambda): {rlsLambda}</label>
              <input type="range" min="0.9" max="1" step="0.001" value={rlsLambda} onChange={e => setRlsLambda(Number(e.target.value))} />
              <label>Initialization (delta): {rlsDelta}</label>
              <input type="range" min="0.001" max="10" step="0.001" value={rlsDelta} onChange={e => setRlsDelta(Number(e.target.value))} />
              <label>Number of samples (N): {rlsN}</label>
              <input type="range" min="100" max="2000" step="10" value={rlsN} onChange={e => setRlsN(Number(e.target.value))} />
            </>)}

            {/* RLS Prediction */}
            {selectedAlgo === "RLS" && selectedMode === "Prediction" && (<>
              <label>Predictor order (P): {rlsP}</label>
              <input type="range" min="1" max="20" step="1" value={rlsP} onChange={e => setRlsP(Number(e.target.value))} />
              <label>Forgetting factor (lambda): {rlsLambda}</label>
              <input type="range" min="0.9" max="1" step="0.001" value={rlsLambda} onChange={e => setRlsLambda(Number(e.target.value))} />
              <label>Initialization (delta): {rlsDelta}</label>
              <input type="range" min="0.001" max="10" step="0.001" value={rlsDelta} onChange={e => setRlsDelta(Number(e.target.value))} />
              <label>Number of samples (N): {rlsN}</label>
              <input type="range" min="100" max="2000" step="10" value={rlsN} onChange={e => setRlsN(Number(e.target.value))} />
            </>)}

          </div>

          <div className={styles.psdContainer} style={{ marginTop: "15px" }}>
            <button onClick={runAlgorithm}>Apply Algorithm</button>
          </div>
        </div>
      </div>
    </div>
  );
};
