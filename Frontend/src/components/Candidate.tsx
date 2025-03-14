"use client";
// Define Candidate interface

export type Item = {
  itemname: string;
  quantity: number;
  expiry: string;
  batchno: string;
  manufacturer: string;
  category: string;
  createdBy: string;
  createdAt: string;
};

export type Patient = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
};