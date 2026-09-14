export interface ICreateAssignmentPayload {
  serviceRequestId: string;
  providerId: string;
}

export interface IUpdateAssignmentPayload {
  status: "ACCEPTED" | "REJECTED";
}