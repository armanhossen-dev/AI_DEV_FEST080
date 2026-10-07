import { Transaction } from "@/types";

export class FraudDetectionModel {
  private model: any = null;
  public isTrained = false;
  
  async loadTF() {
    // Dynamically import tfjs to prevent SSR issues in Next.js
    const tf = await import("@tensorflow/tfjs");
    return tf;
  }

  async trainModel(transactions: Transaction[]) {
    if (this.isTrained) return;

    const tf = await this.loadTF();
    
    // 1. Define Architecture: Simple Sequential Neural Network
    this.model = tf.sequential();
    
    this.model.add(tf.layers.dense({
      inputShape: [5], // Features: [amountRatio, isNewDevice, isOffHours, velocityFlag, locationAnomaly]
      units: 12,
      activation: 'relu'
    }));
    
    this.model.add(tf.layers.dense({
      units: 8,
      activation: 'relu'
    }));

    // Output layer (Fraud probability between 0 and 1)
    this.model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));

    this.model.compile({
      optimizer: tf.train.adam(0.02),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    // 2. Prepare Data (Feature Engineering)
    const features: number[][] = [];
    const labels: number[][] = [];

    transactions.forEach(txn => {
      const amountRatio = (txn.amount || 0) / 6800; // Normalizing against avg baseline
      const isNewDevice = txn.isNewDevice ? 1 : 0;
      
      const time = txn.time || "12:00 PM";
      const isOffHours = time.includes("AM") && ["01", "02", "03", "04", "05", "12"].some(h => time.startsWith(h)) ? 1 : 0;
      
      const velocityFlag = txn.flags?.some(f => f.toLowerCase().includes("velocity") || f.toLowerCase().includes("rapid")) ? 1 : 0;
      const locationAnomaly = txn.isNewLocation ? 1 : 0;

      features.push([amountRatio, isNewDevice, isOffHours, velocityFlag, locationAnomaly]);
      
      // Target label: Using our baseline riskScore as a proxy for ground truth (Fraud = 1, Legit = 0)
      const isFraud = (txn.riskScore || 0) >= 70 ? 1 : 0;
      labels.push([isFraud]);
    });

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    console.log("🧠 Training TensorFlow.js model in-browser on local dataset...");
    
    // 3. Train the model
    await this.model.fit(xs, ys, {
      epochs: 40,
      batchSize: 4,
      shuffle: true,
    });

    console.log("✅ Training complete!");
    this.isTrained = true;
    
    // Cleanup memory tensors
    xs.dispose();
    ys.dispose();
  }

  async predict(txn: Partial<Transaction>): Promise<number> {
    if (!this.isTrained || !this.model) {
      return 0;
    }
    
    const tf = await this.loadTF();
    
    // Extract features for the incoming transaction exactly as we did in training
    const amountRatio = (txn.amount || 0) / 6800;
    const isNewDevice = txn.isNewDevice ? 1 : 0;
    const time = txn.time || "12:00 PM";
    const isOffHours = time.includes("AM") && ["01", "02", "03", "04", "05", "12"].some(h => time.startsWith(h)) ? 1 : 0;
    const velocityFlag = txn.flags?.some(f => f.toLowerCase().includes("velocity") || f.toLowerCase().includes("rapid")) ? 1 : 0;
    const locationAnomaly = txn.isNewLocation ? 1 : 0;

    const inputTensor = tf.tensor2d([[amountRatio, isNewDevice, isOffHours, velocityFlag, locationAnomaly]]);
    
    // Run Inference
    const predictionTensor = this.model.predict(inputTensor) as any;
    const probabilityArray = await predictionTensor.data();
    
    // Cleanup inference memory
    inputTensor.dispose();
    predictionTensor.dispose();

    return probabilityArray[0]; // Returns a probability between 0 and 1
  }
}

export const fraudMLInstance = new FraudDetectionModel();
