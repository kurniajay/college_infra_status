export const SCOPES = ["GENERAL", "UG", "PG"];

export const CATEGORIES = [
  "Academic",
  "Sports & Fitness",
  "Student Facilities",
  "Administrative",
  "Campus Services"
];

export const DEPARTMENTS = [
  { id: "D01", label: "Computer Science & Engineering", hasUg: true, hasPg: true },
  { id: "D02", label: "Information Science & Engineering", hasUg: true, hasPg: true },
  { id: "D03", label: "Electronics & Communication Engineering", hasUg: true, hasPg: true },
  { id: "D04", label: "Electrical & Electronics Engineering", hasUg: true, hasPg: true },
  { id: "D05", label: "Mechanical Engineering", hasUg: true, hasPg: true },
  { id: "D06", label: "Civil Engineering", hasUg: true, hasPg: true },
  { id: "D07", label: "Chemical Engineering", hasUg: true, hasPg: true },
  { id: "D08", label: "Biotechnology", hasUg: true, hasPg: true },
  { id: "D09", label: "Aerospace Engineering", hasUg: true, hasPg: false },
  { id: "D10", label: "Industrial Engineering & Management", hasUg: true, hasPg: false },
  { id: "D11", label: "MCA Department", hasUg: false, hasPg: true }
];

export const BOOKABLE_STATUSES = ["AVAILABLE", "RESERVED", "IN_USE", "CLOSED"];
export const NON_BOOKABLE_STATUSES = ["OPEN", "CLOSED"];

export const TYPES = [
  "Classroom",
  "Lab",
  "Research Lab",
  "Seminar Hall",
  "Auditorium",
  "Library",
  "Conference Hall",
  "Exam Hall",
  "Office",
  "Faculty Room",
  "HOD Cabin",
  "Meeting Room",
  "Workshop",
  "Ground",
  "Court",
  "Track",
  "Sports Hall",
  "Gym",
  "Hostel",
  "Food Court",
  "Canteen",
  "Medical",
  "Counseling",
  "Student Activity Center",
  "Transport",
  "Security",
  "Stores",
  "Utility"
];
