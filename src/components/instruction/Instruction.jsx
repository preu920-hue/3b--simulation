import React, { useContext } from "react";
import styles from "./instruction.module.css";
import { SimulationContext } from "../../context/SimulationContext.jsx";

export const Instruction = () => {
  const { selectedAlgo, selectedMode } = useContext(SimulationContext);

  const isEqualization = selectedMode === "Equalization";
  const isLMS = selectedAlgo === "LMS";

  return (
    <div className={styles.box}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>INSTRUCTIONS</h1>
          <p style={{ fontSize: "13px", color: "#555" }}>
            Mode: <strong>{selectedAlgo} — {selectedMode}</strong>
          </p>
        </div>
        <div className={styles.card}>
          <p><span>STEP 1: </span>Select an <b>ECG Dataset</b> from the dropdown. Adjust the <b>Duration</b> slider as needed and click <b>"Generate ECG Signal"</b>.</p>
        </div>
        <div className={styles.card}>
          <p><span>STEP 2: </span>
            {isEqualization
              ? <>In Algorithm Setup, configure the <b>Filter Order (M)</b> — number of filter taps, and the <b>Step Size (mu)</b> — controls convergence speed.</>
              : <>In Algorithm Setup, configure the <b>Predictor Order (P)</b> — number of past samples used for prediction, and the <b>Step Size (mu)</b>.</>
            }
            {!isLMS && <> Also set <b>Forgetting Factor (lambda)</b> and <b>Initialization (delta)</b> for the RLS filter.</>}
          </p>
        </div>
        <div className={styles.card}>
          <p><span>STEP 3: </span>Set <b>Number of Samples (N)</b> to control the simulation length. More samples show better convergence behaviour.</p>
        </div>
        <div className={styles.card}>
          <p><span>STEP 4: </span>Click <b>"Apply Algorithm"</b> to run the simulation and render output graphs.</p>
        </div>
        <div className={styles.card}>
          <p><span>STEP 5: </span>
            {isEqualization
              ? <>Observe the <b>MSE vs Iterations</b> plot to see error convergence, and the <b>Weight Convergence</b> plots to see filter tap adaptation.</>
              : <>Observe the <b>AR Process Signal</b>, the <b>MSE vs Iterations</b> plot showing prediction error, and the <b>Weight Convergence</b> plots.</>
            }
          </p>
        </div>
      </div>
    </div>
  );
};
