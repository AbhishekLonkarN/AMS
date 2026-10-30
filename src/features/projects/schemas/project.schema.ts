import { z } from 'zod';
import { PROJECT_VALIDATION as V } from '../constants/projects.constants';

const required = () => z.string().trim().min(1, V.required);
const positiveInt = () =>
  z.number({ invalid_type_error: V.positiveNumber, required_error: V.required }).int(V.positiveNumber).min(1, V.positiveNumber);

export function buildProjectSchema(isNameTaken: (name: string) => boolean) {
  return z.object({
    name: required().refine((name) => !isNameTaken(name), V.nameTaken),
    cipNo: required(),
    testProduct: required(),
    description: required(),
    sponsor: required(),
    projectManagerId: required(),
    croName: z.string().trim(),
    croProjectManagerId: z.string(),
    croAssistantPmId: z.string(),
    enrolmentTarget: positiveInt(),
    sitesIdentified: positiveInt(),
    statusId: required(),
    logoFileName: z.string().optional(),
  });
}

export type ProjectFormValues = z.infer<ReturnType<typeof buildProjectSchema>>;
