# MID-WEST UNIVERSITY
## GRADUATE SCHOOL OF ENGINEERING
### CENTRAL DEPARTMENT OF COMPUTER ENGINEERING
**Birendranagar, Surkhet**

---

# SUPERVISOR'S RECOMMENDATION

We hereby recommend that this project report prepared under my supervision by Computer Engineering students **Batch 2079** entitled:

> **"AI FITNESS TRACKER: A MULTI-MODAL ATHLETIC PROGRESSION, REAL-TIME POSE ANALYSIS, GPS RUNNING & WORKOUT INTELLIGENCE PLATFORM"**

in partial fulfillment of the requirements for the degree of **BE(Computer Engineering)** is recommended for the mid-year evaluation.

<br><br>

______________________________________  
**Er. Basant Rawat**  
Assistant Professor  
Graduate School of Engineering  
Central Department of Computer Engineering  
Birendranagar, Surkhet  

---

# CERTIFICATE OF APPROVAL

This is to certify that this project report is prepared by:
- **Athit Rijal** [Symbol No. 2604070004]
- **Dhurbaraj Singh** [Symbol No. 2604070006]
- **Paras Khadka** [Symbol No. 2604070013]
- **Sushil Kumar Thapa** [Symbol No. 2604070021]

Computer Engineering Students, **2079 Batch**, entitled **"AI FITNESS TRACKER: A MULTI-MODAL ATHLETIC PROGRESSION, REAL-TIME POSE ANALYSIS, GPS RUNNING & WORKOUT INTELLIGENCE PLATFORM"** in partial fulfillment of the requirements for the degree of **BE Computer Engineering** has been evaluated. In our opinion it is satisfactory in the scope and quality as a project for the required degree.

<br><br>

| ______________________________________ | ______________________________________ |
| :--- | :--- |
| **Er. Basant Rawat**<br>Assistant Professor<br>Project Supervisor<br>Central Department of Computer Engineering | **Er. Kapil Budhathoki**<br>Assistant Professor<br>Coordinator<br>Central Department of Computer Engineering |

---

# COPYRIGHT

The authors have agreed that the Library, Central Department of Computer Engineering, Graduate School of Engineering may make this report freely available for inspection. Moreover, the authors have agreed that permission for extensive copying of this project report for scholarly purpose may be granted by the supervisors who supervised the project work recorded herein or in their absence, by the Head of the Department wherein the project report was done.

It is understood that the recognition will be given to the authors of this project and to the Central Department of Computer Engineering, Graduate School of Engineering in any use of the material of this report. Copying or publication or other use of this report for financial gain without approval of the Central Department of Computer Engineering, Graduate School of Engineering and author's written permission is strictly prohibited.

Request for permission to copy or to make any use of the material in this project in whole or part should be addressed to Central Department of Computer Engineering, Graduate School of Engineering, Mid-West University, Birendranagar, Surkhet.

---

# ACKNOWLEDGEMENT

The success of this project required a lot of guidance and assistance from many people and we are extremely fortunate to have received this throughout the development of our final year project. Whatever we have accomplished is only due to such guidance and assistance and we would not forget to thank them.

Firstly, we would like to thank the **Faculty of Engineering** for including the final year project as an integral component of our curriculum. Special thanks go to the **Central Department of Computer Engineering** for facilitating this project to further enhance our knowledge of artificial intelligence, deep learning, computer vision kinematics, distributed mobile applications, and full-stack software development.

We respect and thank our Supervisor **Er. Basant Rawat** for providing all necessary support, valuable guidance, and continuous encouragement throughout the project development phase. His insights and expertise in software architecture, distributed systems, and computer engineering were instrumental in shaping this project.

We are thankful and fortunate to have received constant encouragement, support, and guidance from Coordinator **Er. Kapil Budhathoki** and all teaching staff of the Central Department of Computer Engineering, which helped us successfully complete our project work. We also express our gratitude to our colleagues and athletic testers who provided feedback during development.

**Project Members:**
- **Athit Rijal** [Symbol No. 2604070004]
- **Dhurbaraj Singh** [Symbol No. 2604070006]
- **Paras Khadka** [Symbol No. 2604070013]
- **Sushil Kumar Thapa** [Symbol No. 2604070021]

---

# ABSTRACT

The **AI Fitness Tracker** is an all-in-one, multi-modal athletic training and exercise intelligence platform engineered to unify resistance weight training, bodyweight calisthenics skill progressions, and outdoor endurance GPS running into a high-performance offline-first architecture. Existing fitness applications are fragmented across single-discipline silos, enforce expensive paywalls, and fail to provide offline functional autonomy or biomechanical guidance.

The client application is built with **React Native** and **Expo SDK 52**, employing a decoupled architecture. It features an active resistance training module with automated set-by-set logging, one-rep maximum (1RM) Brzycki estimation, rest-interval audio-haptic timers, and automatic Personal Record (PR) milestone detection. For bodyweight athletes, the system introduces interactive Calisthenics Skill Progression Trees across five disciplines (Push, Pull, Legs, Core, Handstand) with deterministic level-unlocking logic. An outdoor GPS tracking engine incorporates background location execution, Haversine spatial distance accumulation, rolling pace windowing, and audio kilometer splits.

To assist form execution, the platform integrates a computer vision kinematic pipeline utilizing MediaPipe BlazePose and OpenCV. By tracking 33 skeletal landmarks and calculating trigonometric joint angles, the system implements a finite state machine that automatically counts repetitions and provides biomechanical feedback.

The backend architecture utilizes **Django REST Framework (DRF)** with **PostgreSQL / Supabase** and **SimpleJWT** session rotation, managing 1,324 verified exercise definitions. To guarantee uninterrupted gym performance without network connectivity, the mobile client executes local write-ahead transactions on **SQLite**, which are asynchronously synchronized to the cloud when connectivity resumes.

At the mid-year evaluation stage, the mobile client, Django backend, database schema, workout logging engine, and GPS run tracker are fully functional and verified. The codebase satisfies 100% type safety (0 TypeScript errors) and passes all 30 unit test suites comprising 222 automated tests.

**Keywords:** *AI Fitness Tracker, Computer Vision, Pose Estimation, Calisthenics Progression Trees, GPS Run Tracking, React Native, Expo, Django REST Framework, PostgreSQL, Offline-First, SQLite, Kinematics*

---

# TABLE OF CONTENTS

- **SUPERVISOR'S RECOMMENDATION** .................................................... i
- **CERTIFICATE OF APPROVAL** ................................................................ ii
- **COPYRIGHT** ............................................................................................ iii
- **ACKNOWLEDGEMENT** ............................................................................ iv
- **ABSTRACT** .............................................................................................. v
- **LIST OF FIGURES** ................................................................................... vii
- **LIST OF TABLES** .................................................................................... viii
- **LIST OF ABBREVIATIONS** ...................................................................... ix

### CHAPTER 1: INTRODUCTION ................................................................ 1
- 1.1 Introduction ............................................................................................ 1
- 1.2 Motivation .............................................................................................. 1
- 1.3 Problem Statement ................................................................................ 2
- 1.4 Objectives .............................................................................................. 3
- 1.5 Scope of Project .................................................................................... 3
- 1.6 Limitations ............................................................................................. 4

### CHAPTER 2: LITERATURE REVIEW ...................................................... 5
- 2.1 mHealth & Strength Training Platforms ................................................ 5
- 2.2 Computer Vision & Kinematic Pose Estimation .................................... 6
- 2.3 Satellite GPS Spatial Filtering & Velocity Estimation ........................... 7
- 2.4 Offline-First Synchronization Architectures .......................................... 8
- 2.5 Session Security & Tokenized APIs ....................................................... 9
- 2.6 Research Gap Analysis .......................................................................... 10

### CHAPTER 3: REQUIREMENT ANALYSIS ................................................ 12
- 3.1 Requirements ........................................................................................ 12
  - 3.1.1 Functional Requirements ................................................................ 12
  - 3.1.2 Non-Functional Requirements ........................................................ 14
  - 3.1.3 Technical Requirements .................................................................. 15
- 3.2 Feasibility Analysis ................................................................................ 16

### CHAPTER 4: SYSTEM ARCHITECTURE AND METHODOLOGY ....... 18
- 4.1 Overall System Architecture ................................................................ 18
- 4.2 Component Architecture & Data Flow ................................................. 19
- 4.3 Database Schema .................................................................................. 20
- 4.4 System Design Diagrams ...................................................................... 21
  - 4.4.1 Class Diagram ................................................................................ 22
  - 4.4.2 Use Case Diagram .......................................................................... 23
  - 4.4.3 Activity Diagram ............................................................................ 24
- 4.5 Methodology ......................................................................................... 25

### CHAPTER 5: IMPLEMENTATION DETAILS .......................................... 26
- 5.1 Frontend Architecture & Component Hierarchy ................................. 26
- 5.2 Active Workout Logging & Automated PR Engine .............................. 27
- 5.3 Computer Vision & Biomechanical Rep Counting ............................... 28
- 5.4 Outdoor GPS Run Tracking & Spatial Smoothing ............................... 30
- 5.5 Backend Django REST Framework API ............................................... 31
- 5.6 Offline-First SQLite Synchronization Queue ....................................... 32

### CHAPTER 6: RESULT AND DISCUSSION .............................................. 34
- 6.1 Progress Achieved ................................................................................ 34
- 6.2 Testing & Quality Assurance ................................................................ 35
- 6.3 Engineering Challenges & Mitigations ................................................ 37
- 6.4 Future Enhancements ............................................................................ 38

### CHAPTER 7: CONCLUSION ..................................................................... 40
### REFERENCES ............................................................................................. 41

---

# CHAPTER 1: INTRODUCTION

## 1.1 Introduction
The rapid integration of mobile smart devices and edge computing has fundamentally transformed athletic training, sports science, and personal health tracking. Millions of individuals engage in physical exercise daily to enhance cardiovascular endurance, muscular strength, and functional mobility. However, modern fitness tracking software remains fundamentally fragmented. Lifters rely on manual workout notepads, calisthenics athletes lack structured skill trees, and outdoor runners depend on separate commercial GPS applications.

The **AI Fitness Tracker** project resolves this fragmentation by engineering an all-in-one athletic tracking and machine learning platform. Built on React Native (Expo SDK 52) and Django REST Framework with PostgreSQL / Supabase, the platform unifies resistance training, calisthenics skill progressions, outdoor GPS running, and computer vision pose analysis.

## 1.2 Motivation
Commercial fitness platforms suffer from three major shortcomings:
1. **Intrusive Subscriptions**: Platforms lock basic features like workout analytics and custom routines behind paywalls.
2. **Disciplinary Silos**: Applications force athletes into single-activity silos (e.g., Strava for running only, Strong for lifting only).
3. **Gym Connectivity Dead Zones**: Cloud-dependent apps fail in basement gyms where cellular signals drop.

## 1.3 Problem Statement
Mobile athletic monitoring systems suffer from three primary engineering gaps:
- **Offline Data Gap**: Dropping packets in dead zones causes data loss without local write-ahead SQLite logging.
- **Progression Representation Gap**: Calisthenics requires nonlinear unlockable skill trees, which tabular fitness apps cannot represent.
- **Form Verification Gap**: Athletes training independently risk injury without real-time biomechanical feedback.

## 1.4 Objectives
- Develop an offline-first mobile client using React Native, Expo SDK 52, and TypeScript.
- Implement an active workout logging engine with automated Personal Record (PR) detection and rest timers.
- Design Calisthenics Skill Trees across 5 mastery lines (Push, Pull, Legs, Core, Handstand).
- Build a background GPS running engine with Haversine distance accumulation and pace smoothing.
- Prototype a computer vision pose estimation pipeline using MediaPipe BlazePose and OpenCV.
- Implement a Django REST Framework backend with PostgreSQL and SimpleJWT token rotation.

---

# CHAPTER 2: LITERATURE REVIEW

## 2.1 Survey of mHealth & Strength Training Platforms
Higgins (2016) found that smartphone fitness applications significantly improve exercise adherence. However, commercial apps focus on step counting rather than progressive overload. Helms et al. (2016) demonstrated that structured volume progression (Sets × Reps × Weight) and Rate of Perceived Exertion (RPE) are the primary determinants of muscular adaptation.

## 2.2 Computer Vision Pose Estimation
Bazrev et al. (2020) formulated **BlazePose**, achieving 33 full-body anatomical landmark detections at over 30 FPS on consumer mobile hardware. Velloso et al. (2013) demonstrated that 3-point joint angles accurately differentiate exercise phases and identify kinematic faults.

## 2.3 Satellite GPS Spatial Filtering
Sinnott (1984) formulated the Haversine equation for great-circle distance calculation. Weng et al. (2019) demonstrated that dropping GPS points with horizontal accuracy worse than 15 meters and applying rolling velocity smoothing reduces trajectory error by up to 84%.

## 2.4 Research Gap
| Platform | Focus | Limitations | Gap Addressed by This Project |
| :--- | :--- | :--- | :--- |
| **Strava** | GPS Running & Cycling | No strength/calisthenics tracking; paywalled analytics. | Full multi-modal synthesis (Gym + Run + Calisthenics). |
| **Strong/Hevy** | Resistance Weight Training | No GPS running; no computer vision form checking. | Integrated GPS engine; CV rep counting; 0 paywalls. |
| **Proposed AI Fitness Tracker** | **Multi-Modal Athletic Intelligence** | **None of the above** | **100% offline-first architecture with SQLite write-ahead logging, GPS running, calisthenics trees, and CV form guidance.** |

---

# CHAPTER 3: REQUIREMENT ANALYSIS

## 3.1 Functional Requirements
- **FR-01**: User registration and JWT authentication with token rotation.
- **FR-02**: Verified database of 1,324 exercises filterable by 9 muscle groups.
- **FR-03**: Custom routine builder with superset support.
- **FR-04**: Active workout logging with pre-filled weights and rest countdown timers.
- **FR-05**: Automated Personal Record (PR) milestone detection.
- **FR-06**: Calisthenics progression trees across Push, Pull, Legs, Core, Handstand.
- **FR-07**: Outdoor GPS running with background location and audio split callouts.
- **FR-08**: Computer vision joint angle calculation and rep counting.

## 3.2 Non-Functional Requirements
- **Performance**: 60 FPS UI rendering, sub-20ms local database operations.
- **Offline Autonomy**: 100% of workout and run tracking functional without network connectivity.
- **Reliability**: Immediate SQLite write-ahead persistence preventing data loss during crashes.
- **Security**: Cryptographic password hashing and JWT token rotation.

---

# CHAPTER 4: SYSTEM ARCHITECTURE AND METHODOLOGY

AI Fitness Tracker follows a strictly decoupled client-server architecture. The mobile client utilizes Expo Router, Zustand stores, and on-device SQLite for offline autonomy. Synchronization occurs asynchronously with the Django REST Framework backend and PostgreSQL / Supabase database.

### System Class Diagram
```
+------------------+         +--------------------+         +-------------------+
|      User        | 1     * |      Routine       | 1     * |   WorkoutSession  |
|------------------|-------->|--------------------|-------->|-------------------|
| - id: UUID       |         | - id: UUID         |         | - id: UUID        |
| - email: String  |         | - name: String     |         | - startTime: Time |
| - profile: Object|         | - exercises: List  |         | - sets: List<Set> |
+------------------+         +--------------------+         +-------------------+
                                       | 1                            | 1
                                       | *                            | *
                             +--------------------+         +-------------------+
                             |     Exercise       | 1     * |    WorkoutSet     |
                             |--------------------|-------->|-------------------|
                             | - id: UUID         |         | - weightKg: Float |
                             | - name: String     |         | - reps: Int       |
                             | - muscleGroup: Enum|         | - rpe: Float      |
                             +--------------------+         +-------------------+
```

---

# CHAPTER 5: IMPLEMENTATION DETAILS

- **Active Workout Engine**: Implemented in `activeWorkoutStore.ts` with set-by-set logging, automated Brzycki 1RM formula calculation, and haptic rest timers.
- **Computer Vision Kinematics**: Implemented using MediaPipe BlazePose 33 landmarks, calculating joint angles via dot product trigonometry with finite-state repetition counting.
- **GPS Spatial Smoothing**: Background execution via `expo-task-manager`, 15-meter horizontal accuracy gate, Haversine distance accumulation, and rolling pace calculation.
- **Offline Sync Queue**: Implemented in `syncQueue.ts` with client-generated UUIDv4 keys and SQLite write-ahead batch dispatching.

---

# CHAPTER 6: RESULT AND DISCUSSION

- **TypeScript Static Verification**: 0 errors (`npm run typecheck`).
- **Jest Unit Tests**: 30 test suites, 222 tests all passing (100% pass rate).
- **Backend Health Check**: Django server verified on `http://0.0.0.0:4000/api/v1` and public HTTPS Cloudflare tunnel.
- **Android APK Build**: Successfully compiled, verified, and signed with APK Signature Scheme v2: `releases/ai-fitness-tracker-v1.0.0.apk` (70 MB).

---

# CHAPTER 7: CONCLUSION

The **AI Fitness Tracker** successfully proves that modern athletic software can provide multi-modal functionality across resistance training, calisthenics skill trees, and GPS running without commercial paywalls or cloud dependency. The offline-first architecture guarantees seamless performance in real-world training environments.

---

# REFERENCES

1. Bazrev, V., et al. (2020). BlazePose: On-device Real-time Body Pose tracking. *arXiv:2006.10204*.
2. Helms, E. R., et al. (2016). Application of the repetitions in reserve-based RPE scale. *Strength & Conditioning Journal*.
3. Higgins, J. P. (2016). Smartphone applications for health and fitness. *The American Journal of Medicine*.
4. Jones, M., et al. (2015). JSON Web Token (JWT). *RFC 7519*.
5. Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly Media.
6. Lugaresi, C., et al. (2019). MediaPipe: Perception Pipelines. *arXiv:1906.08172*.
7. Sinnott, R. W. (1984). Virtues of the Haversine. *Sky and Telescope*.
8. Siriwardena, P. (2020). *Advanced API Security*. Apress.
9. Velloso, E., et al. (2013). Qualitative activity recognition of weight lifting. *Augmented Human*.
10. Weng, C. H., et al. (2019). Improving smartphone GPS trajectory accuracy. *IEEE T-ITS*.
