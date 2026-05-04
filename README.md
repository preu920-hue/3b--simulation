# Experiment 3(a): Adaptive Signal Processing Simulation

This project is a React-based web application that simulates and visualizes adaptive signal processing algorithms for Experiment 3(a). By leveraging modern web technologies, it implements complex mathematical algorithms natively on the client-side, eliminating the need for external backends (like Octave) and ensuring fast, real-time feedback.

## Datasets Used (ECG)

This experiment uses **three ECG datasets** placed in `public/`:

- `public/ecg100.csv`
- `public/ecg200.csv`
- `public/ecg300.csv`

### Dataset format (what the app expects)

All three CSVs include an ECG time column and at least one ECG signal column:

- **Time**: `time_sec` (seconds)
- **Signal**: `ECG_I` (raw ECG)
- **Optional**: `ECG_I_filtered` (a pre-filtered ECG column included in the files)

### How the datasets are used in the app (and why)

- **Where you select them**: In the UI under **Signal Setup → Select ECG Dataset**.
- **What happens after selection**: The CSV is downloaded and parsed in the browser, and the time axis is normalized to start at \(t=0\).
- **What gets plotted**: The app plots `ECG_I` as the primary channel.
- **Why these datasets are used here**:
  - They provide a **real sampled ECG waveform** so the filtering/noise modules can be demonstrated on realistic signals.
  - They allow you to compare how different recordings behave under the same filtering/processing settings.

## Implemented Algorithms

### 1. Autoregressive (AR) Process via LMS (Least Mean Squares)
This algorithm simulates a 2nd-order Autoregressive (AR) process and applies an LMS adaptive filter to iteratively estimate the optimal filter coefficients. 

- **Key Parameters:** Number of Samples ($N$), Initial Weights ($u_1, u_2$), and Step Size/Learning Rate ($\mu$).
- **Visualizations:**
  - **Mean Square Error (MSE):** Tracks the convergence of the algorithm by plotting the squared error over each iteration.
  - **Random Walk of Weights ($w_1$ & $w_2$):** Displays the trajectory of the estimated filter weights as they adjust and converge toward their optimal theoretical values.

#### How ARP (LMS) is used here (and why)

- **Where you run it**: **Algorithm Setup → Algorithm: AR Process (LMS) → Apply Algorithm**
- **What it uses as input**: The AR process is a **synthetic signal model** (not the ECG CSV). You control \(N\), the initial weights \((u_1, u_2)\), and step size \(\mu\).
- **Why it’s included**: It demonstrates **adaptive filtering and convergence behavior** (MSE decreasing, weights approaching optimal values), which is central to adaptive signal processing.

### 2. MVDR (Minimum Variance Distortionless Response) Beamformer
The MVDR Beamformer is a spatial filtering technique used in antenna arrays. It enhances a desired signal arriving from a specific Direction of Arrival (DOA) while actively suppressing interference from other directions.

- **Key Parameters:** Number of Antennas ($N$), DOA of Signal ($\theta_s$), DOA of Interference ($\theta_i$), Number of Snapshots, Signal-to-Noise Ratio (SNR), Interference-to-Noise Ratio (INR), and Monte Carlo Runs.
- **Visualizations:**
  - **Beam Pattern (Magnitude vs Angle):** Plots the array's spatial response in decibels (dB). It demonstrates the algorithm's effectiveness by showing a peak gain at the desired signal's direction and deep nulls at the interference directions.

#### How MVDR is used here (and why)

- **Where you run it**: **Algorithm Setup → Algorithm: MVDR Beamformer → Apply Algorithm**
- **What it uses as input**: A simulated array/snapshot model driven by your parameters (antennas, DOAs, snapshots, SNR/INR, Monte Carlo runs). Like ARP, it does **not** depend on the ECG CSV.
- **Why it’s included**: MVDR is a classic adaptive/spatial filtering method. In this experiment it demonstrates **interference suppression** and how parameter choices shape the **beam pattern** (main lobe and nulls).

## Technologies Used
* **React & Vite**: Provides a fast and responsive user interface component architecture.
* **Math.js**: Handles the mathematical operations and array manipulations required for the signal processing algorithms.
* **Chart.js & React-Chartjs-2**: Used to render the dynamic, real-time charts for data visualization.
* **PapaParse**: Used to download and parse the CSV datasets in the browser.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```
