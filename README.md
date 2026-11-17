# HeatSeeker

**Course:** ES 335 — Machine Learning  
**Authors:** Bhoomi Agrawal (`24110073`), Dhruv Gupta (`24110108`)  
**Live Interactive Web Viewer:** `(https://heatseeker-ml-es335.github.io/HeatSeeker/)`

**HeatSeeker** is a fast, privacy-preserving human hotspot detector built for ultra-low-resolution **24X32 thermal grids** (temperature readings in °C). Given a single thermal frame from an overhead doorway sensor, it classifies whether a person is present (`+1`) or the floor is empty (`-1`) in less than a millisecond.

All core classifiers (**Linear SVM**, **CART Decision Tree**, and **Random Forest**) are implemented **from scratch in pure NumPy** using modular functions and dictionaries—without using `scikit-learn` to train our main models.

---

## What HeatSeeker Actually Does & Where It Helps
* **Privacy-First Presence Detection:** A $24 \times 32$ thermal array only records coarse heat blobs (`17°C–34°C`), never faces or regular RGB video—making it suitable for classrooms, offices, hospitals, and eldercare spaces where cameras are intrusive.
* **Smart Room & HVAC Automation:** Can act as a lightweight doorway trigger for occupancy-aware lighting, ventilation, and energy saving on low-power edge hardware.
* **Why Classical ML Works Here:** Instead of running a heavy neural network on 768 pixels, HeatSeeker extracts **40 physical thermal features** and classifies a frame with simple vector math or shallow tree splits.

---

## Dataset & Ground-Truth Labeling
We used calibrated indoor thermal recordings from the **Boston University TIDOS Dataset**:
> **Dataset Credit:** M. Cokbas, P. Ishwar, and J. Konrad, *"Low-resolution overhead thermal tripwire for occupancy estimation,"* IEEE/CVF CVPR Workshops (CVPRW), 2020 — **Boston University Visual Information Processing (VIP) Lab**.

* **Source Data:** 6 indoor recordings (*Edge_Cases*, *High_Activity*, *Lecture*, *Lunch_Meeting_1*, *Lunch_Meeting_2*, *Lunch_Meeting_3*) recorded at 16 Hz on a fixed overhead Melexis MLX90640 (`24 × 32`) sensor, paired with manual `.mat` room occupancy logs.
* **Building Clean Frame Labels (`+1` vs. `-1`):**
  Because the `.mat` log records *how many people are inside the room* (not directly whether someone is under the doorway right now), we extract labels strictly from the ground-truth count logs without peeking at pixel temperatures:
  * **`+1` Hotspot Crossing (`685` frames):** The **5-frame window (`0.31 s`)** right as a person walks under the sensor and triggers a room-count change (`3` frames entering, the count-flip frame, and `1` frame exiting).
  * **`-1` Empty Floor (`822` frames):** Confirmed empty-room frames (`count == 0`) at least **±4 seconds (`±64` frames)** away from any crossing so slow walkers do not leak into the empty class *(excluding `Edge_Cases` from `-1`, where people linger or turn around in the doorway while `count` remains `0`)*.
  * *(At test/deployment time, the model never sees any `.mat` log—it predicts purely from one `24 × 32` thermal snapshot.)*

---

## Leakage-Free Pipeline & Feature Engineering (`768 → 40`)
1. **5-Second Block Split (`70% / 15% / 15%`):** Adjacent 16 Hz frames look nearly identical, so we split by 5-second blocks using `GroupShuffleSplit` (`1,055` Train / `230` Validation / `222` Test) to prevent near-duplicate leakage.
2. **Training-Only Background Subtraction:** Using **only** training `-1` frames, we compute a median empty-floor map (`T_bg`) per room and subtract it (`delta = frame - T_bg`) so human body heat pops out clearly above the stationary floor.
3. **40 Physical Features per Frame:**
   * **8** background-subtracted peak & area stats (`delta.max()`, `mean`, `std`, 95th/99th percentiles, pixel fractions `>1.5°C`, `>2.5°C`, `>4.0°C`)
   * **4** room-invariant self-contrast stats (`frame - 25th percentile(frame)`)
   * **4** spatial thermal gradient ($\nabla T$) stats (capturing sharp body edges vs. flat floors)
   * **24** coarse `3 × 4` spatial zone pooling features (max and mean rise in each `8 × 8` pixel block)
4. **Scaling:** `StandardScaler` is fit strictly on `X_train`.

---

## Models Implemented (Pure NumPy)
* **Linear SVM (`train_linear_svm`):** Stochastic subgradient descent on regularized hinge loss (`learning_rate = 0.005`, `lambda = 0.01`).
* **CART Decision Tree (`build_decision_tree`):** Recursive binary tree using Gini impurity (`max_depth = 5`, `min_samples_leaf = 10`).
* **Random Forest (`train_random_forest`):** 40 bootstrapped CART trees (`max_depth = 6`, `max_features = 8`) combined by majority vote.

*(Library `scikit-learn` models — `SVC`, `DecisionTreeClassifier`, `RandomForestClassifier` — are used only as benchmark comparisons.)*

---

## Test Set Results (`n = 222` Unseen Frames)

| Model | Accuracy | Precision | Recall | F1-Score | False Positive Rate | Classifier Speed |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **NumPy Linear SVM (tuned)** | **87.39%** | **97.70%** | 76.58% | 0.8586 | **1.80%** | **0.0004 ms/frame** |
| **NumPy CART Tree (tuned)** | 86.94% | 91.84% | 81.08% | 0.8612 | 7.21% | 0.0008 ms/frame |
| **NumPy Random Forest (40 trees)** | **90.09%** | 96.84% | **82.88%** | **0.8932** | 2.70% | 0.0292 ms/frame |
| `sklearn` Linear SVC (baseline) | 86.04% | 97.62% | 73.87% | 0.8410 | 1.80% | 0.0057 ms/frame |
| `sklearn` Decision Tree (baseline) | 86.94% | 96.59% | 76.58% | 0.8543 | 2.70% | 0.0008 ms/frame |
| `sklearn` Random Forest (baseline) | 90.09% | 94.95% | 84.68% | 0.8952 | 4.50% | 0.0256 ms/frame |

* **Sensor Noise Robustness ($\sigma = 0.0^\circ\text{C}$ to $3.0^\circ\text{C}$):** Up to $\sigma = 0.5^\circ\text{C}$, all three NumPy models hold ~`0.75–0.79` F1. Under heavy noise ($1.0^\circ\text{C} - 3.0^\circ\text{C}$), Linear SVM and Random Forest stay near `0.70` F1 while a single CART tree drops to `0.66` F1.

---

## Honest Scope & Restrictions
All results in HeatSeeker are measured strictly on **BU TIDOS indoor doorway crossings**. Extending this approach to other settings (such as overheating equipment checks, non-contact medical thermal screening, or moving IR cameras) is **not a 1-to-1 drop-in**:
* **Stationary Overhead Setup:** Trained only on fixed ceiling-mounted `24 × 32` doorway views; handheld or moving cameras need continuously updated backgrounds instead of a saved room-floor map (`T_bg`).
* **Single-Frame Presence Only:** Predicts hotspot vs. empty per snapshot—counting people entering/leaving or tracking moving targets requires linking detections across consecutive frames.
* **Domain Calibration & Resolution:** Different environments (industrial machinery, medical imaging, outdoor glare) have different target sizes and heat clutter and require higher-resolution sensors (`160×120+`) plus domain-specific retraining.

---

## How to Run
1. Download the **BU TIDOS** dataset (from Boston University VIP Lab) and set `TIDOS_ROOT` in Cell 2 of the `.ipynb` notebook to your local dataset folder.
2. Run all cells in the notebook to train the pure NumPy models, run benchmarks/noise tests, and generate `predictions.json`.
3. Open the interactive web viewer via GitHub Pages (or run locally from the website folder with `python -m http.server 8000` and visit `http://localhost:8000`).

---

## AI Usage & Transparency
AI tools were used as coding and formatting aids during this project—helping organize our pure NumPy implementations, build the TIDOS `.json`/`.mat` loader, inspect error heatmaps, and generate the static GitHub Pages frontend from our notebook outputs and `predictions.json`. All design decisions, leakage checks, experiments, and final validations were run and verified locally by **Bhoomi Agrawal** and **Dhruv Gupta**.
