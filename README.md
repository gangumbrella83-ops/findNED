FindNed – Lost and Found Management System
Overview

FindNed is a role-based, web-enabled Lost and Found Management System developed for students and administrative staff of NED University of Engineering and Technology (NEDUET). It provides a centralized platform to report, track, and recover lost items across campus.

Problem Statement

NEDUET lacks a structured system for managing lost and found items. Existing methods are informal, untracked, and inefficient, making item recovery difficult. FindNed addresses this by digitizing and organizing the entire process.

Objectives
Provide a centralized lost and found platform
Improve item recovery efficiency
Ensure transparency and accountability
Reduce reliance on manual processes
Tech Stack

Frontend:

React 18
Vite
Tailwind CSS

Backend / Database:

Firebase
Cloud Firestore

Deployment:

GitHub Pages
Features

User:

Register and login
Report lost items
Report found items
Browse and search listings
Claim items

Admin:

Manage users
Approve or delete posts
Monitor system activity
Update item status
Non-Functional Requirements
Responsive user interface
Secure authentication
Scalable architecture
High availability via Firebase
Setup
git clone https://github.com/your-username/findned.git
cd findned
npm install
npm run dev
Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};
Deployment
npm run build
npx gh-pages -d dist
Assumptions
Users belong to NEDUET
Internet access is available
Firebase services are operational
Constraints
Limited to university users
Dependent on Firebase services
No offline support
License

This project is developed for academic purposes.
