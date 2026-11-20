import { z } from 'zod';
import { ETMF_VALIDATION as V } from '../constants/etmf.constants';

const required = () => z.string().trim().min(1, V.required);

/** Dates are optional calendar dates (YYYY-MM-DD); the file is required in substance, though not starred in the source. */
export function buildEtmfSchema(isSrNoTaken: (srNo: string) => boolean) {
  return z.object({
    srNo: required()
      .regex(/^\d+(\.\d+)*\)?$/, V.srNoFormat)
      .refine((value) => !isSrNoTaken(value), V.srNoTaken),
    title: required(),
    documentDate: z.string().optional(),
    version: z.string().trim().optional(),
    validityDate: z.string().optional(),
    fileName: z.string().min(1, V.fileRequired),
  });
}

export type EtmfFormValues = z.infer<ReturnType<typeof buildEtmfSchema>>;
