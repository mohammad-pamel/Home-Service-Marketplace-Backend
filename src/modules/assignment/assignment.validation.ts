import z from "zod";

const CreateAssignmentZodSchema = z.object({
  serviceRequestId: z.string().uuid("Invalid service request ID"),
  providerId: z.string().uuid("Invalid provider ID"),
});

const UpdateAssignmentZodSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export const AssignmentValidation = {
  CreateAssignmentZodSchema,
  UpdateAssignmentZodSchema,
};