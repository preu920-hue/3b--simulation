// LMS Equalization
export function runLMS_Equalization(N, M, mu) {
  const s = Array.from({length: N}, () => (Math.random() > 0.5 ? 1 : -1));
  // channel: simple FIR h=[1, 0.5]
  const h = [1, 0.5];
  const r = s.map((_, i) => h[0]*s[i] + (i > 0 ? h[1]*s[i-1] : 0) + 0.1*(Math.random()-0.5));

  let w = new Array(M).fill(0);
  const mse = [];
  const w_history = Array.from({length: M}, () => []);

  for (let i = M; i < N; i++) {
    const x = r.slice(i - M, i).reverse();
    const y = w.reduce((sum, wi, j) => sum + wi * x[j], 0);
    const e = s[i - Math.floor(M/2)] - y;
    mse.push(e * e);
    w = w.map((wi, j) => wi + mu * e * x[j]);
    w.forEach((wi, j) => w_history[j].push(wi));
  }

  return {
    mse,
    weights: w_history,
    iterations: Array.from({length: mse.length}, (_, i) => i + 1),
    finalWeights: w,
  };
}

// LMS Prediction
export function runLMS_Prediction(N, P, mu) {
  // AR process: u[n] = 0.75*u[n-1] - 0.5*u[n-2] + noise
  const v = Array.from({length: N}, () => (Math.random() - 0.5) * 0.5);
  const u = new Array(N).fill(0);
  u[0] = 0.5; u[1] = 1.0;
  for (let i = 2; i < N; i++) u[i] = 0.75*u[i-1] - 0.5*u[i-2] + v[i];

  let w = new Array(P).fill(0);
  const mse = [];
  const w_history = Array.from({length: P}, () => []);

  for (let i = P; i < N; i++) {
    const x = u.slice(i - P, i).reverse();
    const y_pred = w.reduce((s, wi, j) => s + wi * x[j], 0);
    const e = u[i] - y_pred;
    mse.push(e * e);
    w = w.map((wi, j) => wi + mu * e * x[j]);
    w.forEach((wi, j) => w_history[j].push(wi));
  }

  const signal = u.slice(0, Math.min(N, 300));

  return {
    mse,
    weights: w_history,
    iterations: Array.from({length: mse.length}, (_, i) => i + 1),
    signal,
    finalWeights: w,
  };
}

// NLMS Equalization
export function runNLMS_Equalization(N, M, mu, eps) {
  const s = Array.from({length: N}, () => (Math.random() > 0.5 ? 1 : -1));
  const h = [1, 0.5];
  const r = s.map((_, i) => h[0]*s[i] + (i > 0 ? h[1]*s[i-1] : 0) + 0.1*(Math.random()-0.5));

  let w = new Array(M).fill(0);
  const mse = [];
  const w_history = Array.from({length: M}, () => []);

  for (let i = M; i < N; i++) {
    const x = r.slice(i - M, i).reverse();
    const norm = x.reduce((s, xi) => s + xi*xi, 0) + eps;
    const y = w.reduce((sum, wi, j) => sum + wi * x[j], 0);
    const e = s[i - Math.floor(M/2)] - y;
    mse.push(e * e);
    const step = mu / norm;
    w = w.map((wi, j) => wi + step * e * x[j]);
    w.forEach((wi, j) => w_history[j].push(wi));
  }

  return {
    mse,
    weights: w_history,
    iterations: Array.from({length: mse.length}, (_, i) => i + 1),
    finalWeights: w,
  };
}

// NLMS Prediction
export function runNLMS_Prediction(N, P, mu, eps) {
  const v = Array.from({length: N}, () => (Math.random() - 0.5) * 0.5);
  const u = new Array(N).fill(0);
  u[0] = 0.5; u[1] = 1.0;
  for (let i = 2; i < N; i++) u[i] = 0.75*u[i-1] - 0.5*u[i-2] + v[i];

  let w = new Array(P).fill(0);
  const mse = [];
  const w_history = Array.from({length: P}, () => []);

  for (let i = P; i < N; i++) {
    const x = u.slice(i - P, i).reverse();
    const norm = x.reduce((s, xi) => s + xi*xi, 0) + eps;
    const y_pred = w.reduce((s, wi, j) => s + wi * x[j], 0);
    const e = u[i] - y_pred;
    mse.push(e * e);
    const step = mu / norm;
    w = w.map((wi, j) => wi + step * e * x[j]);
    w.forEach((wi, j) => w_history[j].push(wi));
  }

  const signal = u.slice(0, Math.min(N, 300));

  return {
    mse,
    weights: w_history,
    iterations: Array.from({length: mse.length}, (_, i) => i + 1),
    signal,
    finalWeights: w,
  };
}

// RLS Equalization
export function runRLS_Equalization(N, M, lambda, delta) {
  const s = Array.from({ length: N }, () => (Math.random() > 0.5 ? 1 : -1));
  const h = [1, 0.5];
  const r = s.map(
    (_, i) =>
      h[0] * s[i] +
      (i > 0 ? h[1] * s[i - 1] : 0) +
      0.1 * (Math.random() - 0.5)
  );

  let w = new Array(M).fill(0);
  let P = Array.from({ length: M }, (_, i) =>
    Array.from({ length: M }, (_, j) => (i === j ? 1 / Math.max(delta, 1e-9) : 0))
  );

  const mse = [];
  const w_history = Array.from({ length: M }, () => []);

  for (let i = M; i < N; i++) {
    const x = r.slice(i - M, i).reverse();
    const d = s[i - Math.floor(M / 2)];

    // Px
    const Px = new Array(M).fill(0);
    for (let row = 0; row < M; row++) {
      let sum = 0;
      for (let col = 0; col < M; col++) sum += P[row][col] * x[col];
      Px[row] = sum;
    }

    let xTPx = 0;
    for (let k = 0; k < M; k++) xTPx += x[k] * Px[k];
    const denom = Math.max(lambda + xTPx, 1e-12);

    const K = Px.map((v) => v / denom);

    let y = 0;
    for (let k = 0; k < M; k++) y += w[k] * x[k];
    const e = d - y;
    mse.push(e * e);

    for (let k = 0; k < M; k++) w[k] = w[k] + K[k] * e;

    // P = (P - K*x^T*P)/lambda
    const xTP = new Array(M).fill(0);
    for (let col = 0; col < M; col++) {
      let sum = 0;
      for (let row = 0; row < M; row++) sum += x[row] * P[row][col];
      xTP[col] = sum;
    }
    const newP = Array.from({ length: M }, () => new Array(M).fill(0));
    for (let row = 0; row < M; row++) {
      for (let col = 0; col < M; col++) {
        newP[row][col] = (P[row][col] - K[row] * xTP[col]) / Math.max(lambda, 1e-12);
      }
    }
    P = newP;

    w.forEach((wi, j) => w_history[j].push(wi));
  }

  return {
    mse,
    weights: w_history,
    iterations: Array.from({ length: mse.length }, (_, i) => i + 1),
    finalWeights: w,
  };
}

// RLS Prediction
export function runRLS_Prediction(N, Porder, lambda, delta) {
  const v = Array.from({ length: N }, () => (Math.random() - 0.5) * 0.5);
  const u = new Array(N).fill(0);
  u[0] = 0.5;
  u[1] = 1.0;
  for (let i = 2; i < N; i++) u[i] = 0.75 * u[i - 1] - 0.5 * u[i - 2] + v[i];

  let w = new Array(Porder).fill(0);
  let P = Array.from({ length: Porder }, (_, i) =>
    Array.from({ length: Porder }, (_, j) => (i === j ? 1 / Math.max(delta, 1e-9) : 0))
  );

  const mse = [];
  const w_history = Array.from({ length: Porder }, () => []);

  for (let i = Porder; i < N; i++) {
    const x = u.slice(i - Porder, i).reverse();
    const d = u[i];

    const Px = new Array(Porder).fill(0);
    for (let row = 0; row < Porder; row++) {
      let sum = 0;
      for (let col = 0; col < Porder; col++) sum += P[row][col] * x[col];
      Px[row] = sum;
    }

    let xTPx = 0;
    for (let k = 0; k < Porder; k++) xTPx += x[k] * Px[k];
    const denom = Math.max(lambda + xTPx, 1e-12);

    const K = Px.map((v) => v / denom);

    let y = 0;
    for (let k = 0; k < Porder; k++) y += w[k] * x[k];
    const e = d - y;
    mse.push(e * e);

    for (let k = 0; k < Porder; k++) w[k] = w[k] + K[k] * e;

    const xTP = new Array(Porder).fill(0);
    for (let col = 0; col < Porder; col++) {
      let sum = 0;
      for (let row = 0; row < Porder; row++) sum += x[row] * P[row][col];
      xTP[col] = sum;
    }
    const newP = Array.from({ length: Porder }, () => new Array(Porder).fill(0));
    for (let row = 0; row < Porder; row++) {
      for (let col = 0; col < Porder; col++) {
        newP[row][col] = (P[row][col] - K[row] * xTP[col]) / Math.max(lambda, 1e-12);
      }
    }
    P = newP;

    w.forEach((wi, j) => w_history[j].push(wi));
  }

  const signal = u.slice(0, Math.min(N, 300));

  return {
    mse,
    weights: w_history,
    iterations: Array.from({ length: mse.length }, (_, i) => i + 1),
    signal,
    finalWeights: w,
  };
}
