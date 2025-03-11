import { Lead } from "../models/lead.modal.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/response.js";

// Create a new lead
export const createLead = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if a lead with the same email already exists
  const existingLead = await Lead.findOne({ email });
  if (existingLead) {
    return errorResponse(res, 400, "Email must be unique");
  }
  // Create and save the new lead
  const lead = new Lead(req.body);
  await lead.save();
  successResponse(res, 201, lead);
});
export const getAllLeads = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) {
    filter.status = status;
  }
  const leads = await Lead.find(filter);
  successResponse(res, 200, leads);
});
export const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    return errorResponse(res, 404, "Lead not found");
  }
  successResponse(res, 200, lead);
});
export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!lead) {
    return errorResponse(res, 404, "Lead not found");
  }
  successResponse(res, 200, lead);
});

// Delete a lead by ID
export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) {
    return errorResponse(res, 404, "Lead not found");
  }
  successResponse(res, 204, null);
});
